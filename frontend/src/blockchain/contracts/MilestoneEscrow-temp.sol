// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MilestoneEscrow {
    uint256 public projectCounter;

    struct Project {
        address client;
        address provider;
        uint256 totalAmountWei;
        uint256 milestoneCount;
        uint256 milestoneAmountWei;
        uint256 releasedCount;
        bool funded;
        bool exists;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(uint256 => bool)) public milestoneReleased;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed client,
        address indexed provider,
        uint256 totalAmountWei,
        uint256 milestoneCount,
        uint256 milestoneAmountWei
    );

    event ProjectFunded(
        uint256 indexed projectId,
        uint256 totalAmountWei
    );

    event MilestoneReleased(
        uint256 indexed projectId,
        uint256 indexed milestoneIndex,
        uint256 amountWei
    );

    modifier onlyClient(uint256 projectId) {
        require(projects[projectId].exists, "Project does not exist");
        require(msg.sender == projects[projectId].client, "Only client can call");
        _;
    }

    function createProject(
        address provider,
        uint256 milestoneCount
    ) external payable returns (uint256) {
        require(provider != address(0), "Invalid provider");
        require(provider != msg.sender, "Client and provider must differ");
        require(milestoneCount > 0, "Milestone count must be > 0");
        require(msg.value > 0, "Funding is required");
        require(msg.value % milestoneCount == 0, "ETH must divide equally by milestones");

        projectCounter += 1;

        uint256 milestoneAmountWei = msg.value / milestoneCount;

        projects[projectCounter] = Project({
            client: msg.sender,
            provider: provider,
            totalAmountWei: msg.value,
            milestoneCount: milestoneCount,
            milestoneAmountWei: milestoneAmountWei,
            releasedCount: 0,
            funded: true,
            exists: true
        });

        emit ProjectCreated(
            projectCounter,
            msg.sender,
            provider,
            msg.value,
            milestoneCount,
            milestoneAmountWei
        );

        emit ProjectFunded(projectCounter, msg.value);

        return projectCounter;
    }

    function releaseMilestone(
        uint256 projectId,
        uint256 milestoneIndex
    ) external onlyClient(projectId) {
        Project storage p = projects[projectId];

        require(p.funded, "Project is not funded");
        require(milestoneIndex < p.milestoneCount, "Invalid milestone index");
        require(!milestoneReleased[projectId][milestoneIndex], "Milestone already released");

        milestoneReleased[projectId][milestoneIndex] = true;
        p.releasedCount += 1;

        (bool sent, ) = payable(p.provider).call{value: p.milestoneAmountWei}("");
        require(sent, "ETH transfer failed");

        emit MilestoneReleased(projectId, milestoneIndex, p.milestoneAmountWei);
    }

    function getProject(uint256 projectId)
        external
        view
        returns (
            address client,
            address provider,
            uint256 totalAmountWei,
            uint256 milestoneCount,
            uint256 milestoneAmountWei,
            uint256 releasedCount,
            bool funded
        )
    {
        Project memory p = projects[projectId];
        require(p.exists, "Project does not exist");

        return (
            p.client,
            p.provider,
            p.totalAmountWei,
            p.milestoneCount,
            p.milestoneAmountWei,
            p.releasedCount,
            p.funded
        );
    }
}