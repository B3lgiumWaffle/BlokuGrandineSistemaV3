// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ServiceEscrow {
    struct Milestone {
        string title;
        uint256 amountWei;
        bool settled;
    }

    struct Project {
        uint256 localContractId;
        address client;
        address provider;
        uint256 totalWei;
        bool funded;
        bool clientSigned;
        bool providerAccepted;
        uint256 settledCount;
    }

    uint256 public nextProjectId;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone[]) private projectMilestones;

    event ProjectCreated(
        uint256 indexed projectId,
        uint256 indexed localContractId,
        address indexed provider
    );

    event ProjectFunded(
        uint256 indexed projectId,
        address indexed client,
        uint256 totalWei
    );

    event MilestoneSettled(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        uint256 providerAmountWei,
        uint256 clientRefundAmountWei
    );

    function createProject(
        uint256 localContractId,
        address client,
        address provider,
        string[] calldata titles,
        uint256[] calldata amountsWei
    ) external returns (uint256) {
        require(msg.sender == provider, "Only provider");
        require(client != address(0), "Bad client");
        require(provider != address(0), "Bad provider");
        require(titles.length > 0, "No milestones");
        require(titles.length == amountsWei.length, "Length mismatch");

        uint256 total;
        for (uint256 i = 0; i < amountsWei.length; i++) {
            require(amountsWei[i] > 0, "Bad milestone amount");
            total += amountsWei[i];
        }

        uint256 projectId = nextProjectId++;
        projects[projectId] = Project({
            localContractId: localContractId,
            client: client,
            provider: provider,
            totalWei: total,
            funded: false,
            clientSigned: false,
            providerAccepted: true,
            settledCount: 0
        });

        for (uint256 i = 0; i < titles.length; i++) {
            projectMilestones[projectId].push(
                Milestone({
                    title: titles[i],
                    amountWei: amountsWei[i],
                    settled: false
                })
            );
        }

        emit ProjectCreated(projectId, localContractId, provider);
        return projectId;
    }

    function signAndFund(uint256 projectId) external payable {
        Project storage p = projects[projectId];
        require(msg.sender == p.client, "Only client");
        require(!p.funded, "Already funded");
        require(msg.value == p.totalWei, "Wrong ETH amount");

        p.clientSigned = true;
        p.funded = true;

        emit ProjectFunded(projectId, msg.sender, msg.value);
    }

    function releaseMilestone(uint256 projectId, uint256 milestoneIndex) external {
        Project storage p = projects[projectId];
        require(msg.sender == p.client, "Only client");
        require(p.funded, "Not funded");

        Milestone storage m = projectMilestones[projectId][milestoneIndex];
        require(!m.settled, "Already settled");

        m.settled = true;
        p.settledCount += 1;

        payable(p.provider).transfer(m.amountWei);

        emit MilestoneSettled(projectId, milestoneIndex, m.amountWei, 0);
    }

    function settleMilestone(
        uint256 projectId,
        uint256 milestoneIndex,
        uint256 providerAmountWei,
        uint256 clientRefundAmountWei
    ) external {
        Project storage p = projects[projectId];
        require(msg.sender == p.client || msg.sender == p.provider, "Only parties");
        if (msg.sender == p.provider) {
            require(providerAmountWei == 0, "Provider can only refund");
        }
        require(p.funded, "Not funded");

        Milestone storage m = projectMilestones[projectId][milestoneIndex];
        require(!m.settled, "Already settled");
        require(providerAmountWei + clientRefundAmountWei == m.amountWei, "Amounts must match milestone");

        m.settled = true;
        p.settledCount += 1;

        if (providerAmountWei > 0) {
            payable(p.provider).transfer(providerAmountWei);
        }

        if (clientRefundAmountWei > 0) {
            payable(p.client).transfer(clientRefundAmountWei);
        }

        emit MilestoneSettled(projectId, milestoneIndex, providerAmountWei, clientRefundAmountWei);
    }

    function getMilestones(uint256 projectId) external view returns (Milestone[] memory) {
        return projectMilestones[projectId];
    }
}
