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

    public virtual DbSet<b_inquiry> b_inquiries { get; set; }

    public virtual DbSet<b_listing> b_listings { get; set; }

    public virtual DbSet<b_listing_photo> b_listing_photos { get; set; }

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
