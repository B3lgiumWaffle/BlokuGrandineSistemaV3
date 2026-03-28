using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace BlokuGrandiniuSistema.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<b_category> b_categories { get; set; }

    public virtual DbSet<b_comment> b_comments { get; set; }

    public virtual DbSet<b_completed_list_fragment_history> b_completed_list_fragment_histories { get; set; }

    public virtual DbSet<b_completed_listing_fragment> b_completed_listing_fragments { get; set; }

    public virtual DbSet<b_contract> b_contracts { get; set; }

    public virtual DbSet<b_contract_history> b_contract_histories { get; set; }

    public virtual DbSet<b_contract_message> b_contract_messages { get; set; }

    public virtual DbSet<b_contract_milestone> b_contract_milestones { get; set; }

    public virtual DbSet<b_inquiry> b_inquiries { get; set; }

    public virtual DbSet<b_listing> b_listings { get; set; }

    public virtual DbSet<b_listing_photo> b_listing_photos { get; set; }

    public virtual DbSet<b_notification> b_notifications { get; set; }

    public virtual DbSet<b_rating> b_ratings { get; set; }

    public virtual DbSet<b_requirement> b_requirements { get; set; }

    public virtual DbSet<b_role> b_roles { get; set; }

    public virtual DbSet<b_user> b_users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySql("server=localhost;port=3306;database=bakalauras;user=admin;password=admin", Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.4.32-mariadb"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_general_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<b_category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PRIMARY");

            entity.ToTable("b_category");

            entity.Property(e => e.CategoryId).HasColumnType("int(11)");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.Title).HasMaxLength(100);
        });

        modelBuilder.Entity<b_comment>(entity =>
        {
            entity.HasKey(e => e.commentId).HasName("PRIMARY");

            entity.HasIndex(e => e.fkContractId, "fk_comments_contract");

            entity.HasIndex(e => e.fkListingId, "fk_comments_listing");

            entity.HasIndex(e => e.fkUserId, "fk_comments_user");

            entity.Property(e => e.commentId).HasColumnType("int(11)");
            entity.Property(e => e.commentText).HasColumnType("text");
            entity.Property(e => e.createdAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.fkContractId).HasColumnType("int(11)");
            entity.Property(e => e.fkListingId).HasColumnType("int(11)");
            entity.Property(e => e.fkUserId).HasColumnType("int(11)");
            entity.Property(e => e.isVisible)
                .IsRequired()
                .HasDefaultValueSql("'1'");

            entity.HasOne(d => d.fkContract).WithMany(p => p.b_comments)
                .HasForeignKey(d => d.fkContractId)
                .HasConstraintName("fk_comments_contract");

            entity.HasOne(d => d.fkListing).WithMany(p => p.b_comments)
                .HasForeignKey(d => d.fkListingId)
                .HasConstraintName("fk_comments_listing");

            entity.HasOne(d => d.fkUser).WithMany(p => p.b_comments)
                .HasForeignKey(d => d.fkUserId)
                .HasConstraintName("fk_comments_user");
        });

        modelBuilder.Entity<b_completed_list_fragment_history>(entity =>
        {
            entity.HasKey(e => e.historyId).HasName("PRIMARY");

            entity.ToTable("b_completed_list_fragment_history");

            entity.HasIndex(e => e.fkContractId, "fk_fragment_history_contract");

            entity.HasIndex(e => e.changedByUserId, "fk_fragment_history_user");

            entity.Property(e => e.historyId).HasColumnType("int(11)");
            entity.Property(e => e.changedAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.changedByUserId).HasColumnType("int(11)");
            entity.Property(e => e.delayInDays).HasColumnType("int(11)");
            entity.Property(e => e.fkContractId).HasColumnType("int(11)");
            entity.Property(e => e.milestoneIndex).HasColumnType("int(11)");
            entity.Property(e => e.newStatus).HasMaxLength(50);
            entity.Property(e => e.note).HasColumnType("text");
            entity.Property(e => e.oldStatus).HasMaxLength(50);

            entity.HasOne(d => d.changedByUser).WithMany(p => p.b_completed_list_fragment_histories)
                .HasForeignKey(d => d.changedByUserId)
                .HasConstraintName("fk_fragment_history_user");

            entity.HasOne(d => d.fkContract).WithMany(p => p.b_completed_list_fragment_histories)
                .HasForeignKey(d => d.fkContractId)
                .HasConstraintName("fk_fragment_history_contract");
        });

        modelBuilder.Entity<b_completed_listing_fragment>(entity =>
        {
            entity.HasKey(e => e.fragmentId).HasName("PRIMARY");

            entity.ToTable("b_completed_listing_fragment");

            entity.HasIndex(e => e.approvedByUserId, "fk_fragment_approved_by");

            entity.HasIndex(e => e.submittedByUserId, "fk_fragment_submitted_by");

            entity.HasIndex(e => e.fkContractId, "idx_fragment_contract");

            entity.HasIndex(e => e.fkMilestoneId, "idx_fragment_milestone");

            entity.HasIndex(e => e.fkRequirementId, "idx_fragment_requirement");

            entity.HasIndex(e => e.status, "idx_fragment_status");

            entity.Property(e => e.fragmentId).HasColumnType("int(11)");
            entity.Property(e => e.approvedAt).HasColumnType("datetime");
            entity.Property(e => e.approvedByUserId).HasColumnType("int(11)");
            entity.Property(e => e.createdAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.description).HasColumnType("text");
            entity.Property(e => e.filePath).HasMaxLength(500);
            entity.Property(e => e.fkContractId).HasColumnType("int(11)");
            entity.Property(e => e.fkMilestoneId).HasColumnType("int(11)");
            entity.Property(e => e.fkRequirementId).HasColumnType("int(11)");
            entity.Property(e => e.releaseTxHash).HasMaxLength(255);
            entity.Property(e => e.reviewComment).HasColumnType("text");
            entity.Property(e => e.status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Submitted'");
            entity.Property(e => e.submittedAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.submittedByUserId).HasColumnType("int(11)");
            entity.Property(e => e.title).HasMaxLength(255);
            entity.Property(e => e.updatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");

            entity.HasOne(d => d.approvedByUser).WithMany(p => p.b_completed_listing_fragmentapprovedByUsers)
                .HasForeignKey(d => d.approvedByUserId)
                .HasConstraintName("fk_fragment_approved_by");

            entity.HasOne(d => d.fkContract).WithMany(p => p.b_completed_listing_fragments)
                .HasForeignKey(d => d.fkContractId)
                .HasConstraintName("fk_fragment_contract");

            entity.HasOne(d => d.fkMilestone).WithMany(p => p.b_completed_listing_fragments)
                .HasForeignKey(d => d.fkMilestoneId)
                .HasConstraintName("fk_fragment_milestone");

            entity.HasOne(d => d.submittedByUser).WithMany(p => p.b_completed_listing_fragmentsubmittedByUsers)
                .HasForeignKey(d => d.submittedByUserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_fragment_submitted_by");
        });

        modelBuilder.Entity<b_contract>(entity =>
        {
            entity.HasKey(e => e.contractId).HasName("PRIMARY");

            entity.ToTable("b_contract");

            entity.HasIndex(e => e.fkClientUserId, "idx_contract_client");

            entity.HasIndex(e => e.fkInquiryId, "idx_contract_inquiry");

            entity.HasIndex(e => e.fkProviderUserId, "idx_contract_provider");

            entity.HasIndex(e => e.status, "idx_contract_status");

            entity.Property(e => e.contractId).HasColumnType("int(11)");
            entity.Property(e => e.agreedAmountEur).HasPrecision(18, 2);
            entity.Property(e => e.chainProjectId).HasColumnType("bigint(20)");
            entity.Property(e => e.clientWalletAddress).HasMaxLength(255);
            entity.Property(e => e.createdAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.fkClientUserId).HasColumnType("int(11)");
            entity.Property(e => e.fkInquiryId).HasColumnType("int(11)");
            entity.Property(e => e.fkProviderUserId).HasColumnType("int(11)");
            entity.Property(e => e.fundedAmountEth).HasPrecision(18, 8);
            entity.Property(e => e.fundingTxHash).HasMaxLength(255);
            entity.Property(e => e.milestoneAmountEth).HasPrecision(18, 8);
            entity.Property(e => e.milestoneCount).HasColumnType("int(11)");
            entity.Property(e => e.network)
                .HasMaxLength(50)
                .HasDefaultValueSql("'sepolia'");
            entity.Property(e => e.providerWalletAddress).HasMaxLength(255);
            entity.Property(e => e.smartContractAddress).HasMaxLength(255);
            entity.Property(e => e.status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'PendingFunding'");
            entity.Property(e => e.updatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");

            entity.HasOne(d => d.fkClientUser).WithMany(p => p.b_contractfkClientUsers)
                .HasForeignKey(d => d.fkClientUserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_contract_client");

            entity.HasOne(d => d.fkInquiry).WithMany(p => p.b_contracts)
                .HasForeignKey(d => d.fkInquiryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_contract_inquiry");

            entity.HasOne(d => d.fkProviderUser).WithMany(p => p.b_contractfkProviderUsers)
                .HasForeignKey(d => d.fkProviderUserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_contract_provider");
        });

        modelBuilder.Entity<b_contract_history>(entity =>
        {
            entity.HasKey(e => e.historyId).HasName("PRIMARY");

            entity.ToTable("b_contract_history");

            entity.HasIndex(e => e.fkContractId, "fk_contract_history_contract");

            entity.HasIndex(e => e.changedByUserId, "fk_contract_history_user");

            entity.Property(e => e.historyId).HasColumnType("int(11)");
            entity.Property(e => e.changedAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.changedByUserId).HasColumnType("int(11)");
            entity.Property(e => e.fkContractId).HasColumnType("int(11)");
            entity.Property(e => e.newStatus).HasMaxLength(50);
            entity.Property(e => e.note).HasColumnType("text");
            entity.Property(e => e.oldStatus).HasMaxLength(50);

            entity.HasOne(d => d.changedByUser).WithMany(p => p.b_contract_histories)
                .HasForeignKey(d => d.changedByUserId)
                .HasConstraintName("fk_contract_history_user");

            entity.HasOne(d => d.fkContract).WithMany(p => p.b_contract_histories)
                .HasForeignKey(d => d.fkContractId)
                .HasConstraintName("fk_contract_history_contract");
        });

        modelBuilder.Entity<b_contract_message>(entity =>
        {
            entity.HasKey(e => e.messageId).HasName("PRIMARY");

            entity.HasIndex(e => e.fkSenderUserId, "fk_bcm_sender");

            entity.HasIndex(e => new { e.fkContractId, e.sentAt }, "idx_bcm_contract_sentAt");

            entity.HasIndex(e => new { e.fkReceiverUserId, e.isRead }, "idx_bcm_receiver_isRead");

            entity.Property(e => e.messageId).HasColumnType("int(11)");
            entity.Property(e => e.fkContractId).HasColumnType("int(11)");
            entity.Property(e => e.fkReceiverUserId).HasColumnType("int(11)");
            entity.Property(e => e.fkSenderUserId).HasColumnType("int(11)");
            entity.Property(e => e.messageText).HasColumnType("text");
            entity.Property(e => e.readAt).HasColumnType("datetime");
            entity.Property(e => e.sentAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");

            entity.HasOne(d => d.fkContract).WithMany(p => p.b_contract_messages)
                .HasForeignKey(d => d.fkContractId)
                .HasConstraintName("fk_bcm_contract");

            entity.HasOne(d => d.fkReceiverUser).WithMany(p => p.b_contract_messagefkReceiverUsers)
                .HasForeignKey(d => d.fkReceiverUserId)
                .HasConstraintName("fk_bcm_receiver");

            entity.HasOne(d => d.fkSenderUser).WithMany(p => p.b_contract_messagefkSenderUsers)
                .HasForeignKey(d => d.fkSenderUserId)
                .HasConstraintName("fk_bcm_sender");
        });

        modelBuilder.Entity<b_contract_milestone>(entity =>
        {
            entity.HasKey(e => e.milestoneId).HasName("PRIMARY");

            entity.ToTable("b_contract_milestone");

            entity.HasIndex(e => e.fkContractId, "idx_milestone_contract");

            entity.HasIndex(e => e.fkRequirementId, "idx_milestone_requirement");

            entity.HasIndex(e => e.status, "idx_milestone_status");

            entity.HasIndex(e => new { e.fkContractId, e.milestoneNo }, "uq_contract_milestone_no").IsUnique();

            entity.Property(e => e.milestoneId).HasColumnType("int(11)");
            entity.Property(e => e.amountEth).HasPrecision(18, 8);
            entity.Property(e => e.amountEurSnapshot).HasPrecision(18, 2);
            entity.Property(e => e.createdAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.fkContractId).HasColumnType("int(11)");
            entity.Property(e => e.fkRequirementId).HasColumnType("int(11)");
            entity.Property(e => e.milestoneNo).HasColumnType("int(11)");
            entity.Property(e => e.releaseTxHash).HasMaxLength(255);
            entity.Property(e => e.releasedAt).HasColumnType("datetime");
            entity.Property(e => e.status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Pending'");
            entity.Property(e => e.updatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");

            entity.HasOne(d => d.fkContract).WithMany(p => p.b_contract_milestones)
                .HasForeignKey(d => d.fkContractId)
                .HasConstraintName("fk_milestone_contract");

            entity.HasOne(d => d.fkRequirement).WithMany(p => p.b_contract_milestones)
                .HasForeignKey(d => d.fkRequirementId)
                .HasConstraintName("fk_milestone_requirement");
        });

        modelBuilder.Entity<b_inquiry>(entity =>
        {
            entity.HasKey(e => e.inquiryId).HasName("PRIMARY");

            entity.ToTable("b_inquiry");

            entity.HasIndex(e => e.fk_listingId, "idx_inquiry_listing");

            entity.HasIndex(e => e.fk_userId, "idx_inquiry_user");

            entity.Property(e => e.inquiryId).HasColumnType("int(11)");
            entity.Property(e => e.creationDate)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.description).HasColumnType("text");
            entity.Property(e => e.fk_listingId).HasColumnType("int(11)");
            entity.Property(e => e.fk_userId).HasColumnType("int(11)");
            entity.Property(e => e.lastModifiedBy)
                .HasMaxLength(10)
                .HasDefaultValueSql("'SENDER'");
            entity.Property(e => e.modifiedAt).HasColumnType("datetime");
            entity.Property(e => e.modifiedNote).HasColumnType("text");
            entity.Property(e => e.ownerSeen)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.proposedSum).HasPrecision(10, 2);
            entity.Property(e => e.senderSeen)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'PENDING'");

            entity.HasOne(d => d.fk_listing).WithMany(p => p.b_inquiries)
                .HasForeignKey(d => d.fk_listingId)
                .HasConstraintName("fk_inquiry_listing");

            entity.HasOne(d => d.fk_user).WithMany(p => p.b_inquiries)
                .HasForeignKey(d => d.fk_userId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_inquiry_user");
        });

        modelBuilder.Entity<b_listing>(entity =>
        {
            entity.HasKey(e => e.listingId).HasName("PRIMARY");

            entity.ToTable("b_listing");

            entity.HasIndex(e => e.UploadTime, "idx_listing_uploadTime");

            entity.HasIndex(e => e.userId, "idx_listing_userId");

            entity.Property(e => e.listingId).HasColumnType("int(11)");
            entity.Property(e => e.CategoryId).HasColumnType("int(11)");
            entity.Property(e => e.CompletionTime).HasMaxLength(100);
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.PriceFrom).HasPrecision(10, 2);
            entity.Property(e => e.PriceTo).HasPrecision(10, 2);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UploadTime)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.adminComment)
                .HasMaxLength(1000)
                .UseCollation("utf8_general_ci")
                .HasCharSet("utf8");
            entity.Property(e => e.fkReviewedByUserId).HasColumnType("int(11)");
            entity.Property(e => e.isActivated)
                .HasDefaultValueSql("b'0'")
                .HasColumnType("bit(1)");
            entity.Property(e => e.reviewedAt).HasColumnType("datetime");
            entity.Property(e => e.userId).HasColumnType("int(11)");

            entity.HasOne(d => d.user).WithMany(p => p.b_listings)
                .HasForeignKey(d => d.userId)
                .HasConstraintName("fk_listing_user");
        });

        modelBuilder.Entity<b_listing_photo>(entity =>
        {
            entity.HasKey(e => e.photoId).HasName("PRIMARY");

            entity.ToTable("b_listing_photo");

            entity.HasIndex(e => e.listingId, "idx_photo_listingId");

            entity.HasIndex(e => new { e.listingId, e.IsPrimary }, "idx_photo_primary");

            entity.Property(e => e.photoId).HasColumnType("int(11)");
            entity.Property(e => e.PhotoUrl).HasMaxLength(500);
            entity.Property(e => e.UploadTime)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.listingId).HasColumnType("int(11)");

            entity.HasOne(d => d.listing).WithMany(p => p.b_listing_photos)
                .HasForeignKey(d => d.listingId)
                .HasConstraintName("fk_photo_listing");
        });

        modelBuilder.Entity<b_notification>(entity =>
        {
            entity.HasKey(e => e.notificationId).HasName("PRIMARY");

            entity.HasIndex(e => e.fkUserId, "FK_b_notifications_b_users");

            entity.Property(e => e.notificationId).HasColumnType("int(11)");
            entity.Property(e => e.createdAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.fkUserId).HasColumnType("int(11)");
            entity.Property(e => e.message).HasMaxLength(1000);
            entity.Property(e => e.referenceId).HasColumnType("int(11)");
            entity.Property(e => e.title).HasMaxLength(200);
            entity.Property(e => e.type).HasMaxLength(100);

            entity.HasOne(d => d.fkUser).WithMany(p => p.b_notifications)
                .HasForeignKey(d => d.fkUserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_b_notifications_b_users");
        });

        modelBuilder.Entity<b_rating>(entity =>
        {
            entity.HasKey(e => e.ratingId).HasName("PRIMARY");

            entity.ToTable("b_rating");

            entity.HasIndex(e => e.fkFromUserId, "fk_rating_from_user");

            entity.HasIndex(e => e.fkListingId, "fk_rating_listing");

            entity.HasIndex(e => e.fkToUserId, "fk_rating_to_user");

            entity.HasIndex(e => e.fkContractId, "uq_rating_contract").IsUnique();

            entity.Property(e => e.ratingId).HasColumnType("int(11)");
            entity.Property(e => e.createdAt)
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.fkContractId).HasColumnType("int(11)");
            entity.Property(e => e.fkFromUserId).HasColumnType("int(11)");
            entity.Property(e => e.fkListingId).HasColumnType("int(11)");
            entity.Property(e => e.fkToUserId).HasColumnType("int(11)");
            entity.Property(e => e.systemRating).HasPrecision(4, 2);
            entity.Property(e => e.systemRatingReason).HasColumnType("text");
            entity.Property(e => e.updatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("current_timestamp()")
                .HasColumnType("datetime");
            entity.Property(e => e.userRating).HasColumnType("int(11)");
            entity.Property(e => e.userRatingComment).HasColumnType("text");

            entity.HasOne(d => d.fkContract).WithOne(p => p.b_rating)
                .HasForeignKey<b_rating>(d => d.fkContractId)
                .HasConstraintName("fk_rating_contract");

            entity.HasOne(d => d.fkFromUser).WithMany(p => p.b_ratingfkFromUsers)
                .HasForeignKey(d => d.fkFromUserId)
                .HasConstraintName("fk_rating_from_user");

            entity.HasOne(d => d.fkListing).WithMany(p => p.b_ratings)
                .HasForeignKey(d => d.fkListingId)
                .HasConstraintName("fk_rating_listing");

            entity.HasOne(d => d.fkToUser).WithMany(p => p.b_ratingfkToUsers)
                .HasForeignKey(d => d.fkToUserId)
                .HasConstraintName("fk_rating_to_user");
        });

        modelBuilder.Entity<b_requirement>(entity =>
        {
            entity.HasKey(e => e.requirementId).HasName("PRIMARY");

            entity.ToTable("b_requirement");

            entity.HasIndex(e => e.fk_inquiryId, "idx_req_inquiry");

            entity.Property(e => e.requirementId).HasColumnType("int(11)");
            entity.Property(e => e.description).HasColumnType("text");
            entity.Property(e => e.fileUrl).HasMaxLength(500);
            entity.Property(e => e.fk_inquiryId).HasColumnType("int(11)");

            entity.HasOne(d => d.fk_inquiry).WithMany(p => p.b_requirements)
                .HasForeignKey(d => d.fk_inquiryId)
                .HasConstraintName("fk_requirement_inquiry");
        });

        modelBuilder.Entity<b_role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PRIMARY");

            entity.ToTable("b_role");

            entity.HasIndex(e => e.RoleName, "uq_role_name").IsUnique();

            entity.Property(e => e.RoleId).HasColumnType("int(11)");
            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<b_user>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PRIMARY");

            entity.ToTable("b_user");

            entity.HasIndex(e => e.RoleId, "fk_user_role");

            entity.HasIndex(e => e.Email, "uq_user_email").IsUnique();

            entity.HasIndex(e => e.Username, "uq_user_username").IsUnique();

            entity.Property(e => e.UserId).HasColumnType("int(11)");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.RoleId).HasColumnType("int(11)");
            entity.Property(e => e.Username).HasMaxLength(50);
            entity.Property(e => e.WalletAddress).HasColumnType("text");
            entity.Property(e => e.Website).HasColumnType("text");
            entity.Property(e => e.avatar).HasMaxLength(255);
            entity.Property(e => e.firstname).HasMaxLength(50);
            entity.Property(e => e.lastname).HasMaxLength(50);

            entity.HasOne(d => d.Role).WithMany(p => p.b_users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user_role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
