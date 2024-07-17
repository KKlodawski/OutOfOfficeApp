using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace api.models;

public partial class OutofofficeContext : DbContext
{
    public OutofofficeContext()
    {
    }

    public OutofofficeContext(DbContextOptions<OutofofficeContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Approvalrequest> Approvalrequests { get; set; }

    public virtual DbSet<Employee> Employees { get; set; }

    public virtual DbSet<Leaverequest> Leaverequests { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySql("server=localhost;database=outofoffice;uid=root", Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.4.27-mariadb"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_general_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Approvalrequest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("approvalrequests");

            entity.HasIndex(e => e.Approver, "Approver");

            entity.HasIndex(e => e.LeaveRequest, "LeaveRequest");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("ID");
            entity.Property(e => e.Approver).HasColumnType("int(11)");
            entity.Property(e => e.Comment).HasColumnType("text");
            entity.Property(e => e.LeaveRequest).HasColumnType("int(11)");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'New'")
                .HasColumnType("enum('New','Approved','Rejected','Cancelled')");

            entity.HasOne(d => d.ApproverNavigation).WithMany(p => p.Approvalrequests)
                .HasForeignKey(d => d.Approver)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("approvalrequests_ibfk_1");

            entity.HasOne(d => d.LeaveRequestNavigation).WithMany(p => p.Approvalrequests)
                .HasForeignKey(d => d.LeaveRequest)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("approvalrequests_ibfk_2");
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("employees");

            entity.HasIndex(e => e.PeoplePartner, "PeoplePartner");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("ID");
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.OutOfOfficeBalance).HasColumnType("int(11)");
            entity.Property(e => e.PeoplePartner).HasColumnType("int(11)");
            entity.Property(e => e.Photo).HasMaxLength(255);
            entity.Property(e => e.Position).HasColumnType("enum('HRManager','ProjectManager','Employee','Administrator')");
            entity.Property(e => e.Status).HasColumnType("enum('Active','Inactive')");
            entity.Property(e => e.Subdivision).HasMaxLength(50);

            entity.HasOne(d => d.PeoplePartnerNavigation).WithMany(p => p.InversePeoplePartnerNavigation)
                .HasForeignKey(d => d.PeoplePartner)
                .HasConstraintName("employees_ibfk_1");

            entity.HasMany(d => d.ApprovalRequests).WithMany(p => p.Employees)
                .UsingEntity<Dictionary<string, object>>(
                    "EmployeeApprovalrequest",
                    r => r.HasOne<Approvalrequest>().WithMany()
                        .HasForeignKey("ApprovalRequestId")
                        .HasConstraintName("FK_Employee_ApprovalRequest_ApprovalRequest"),
                    l => l.HasOne<Employee>().WithMany()
                        .HasForeignKey("EmployeeId")
                        .HasConstraintName("FK_Employee_ApprovalRequest_Employee"),
                    j =>
                    {
                        j.HasKey("EmployeeId", "ApprovalRequestId")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("employee_approvalrequest");
                        j.HasIndex(new[] { "ApprovalRequestId" }, "FK_Employee_ApprovalRequest_ApprovalRequest");
                        j.IndexerProperty<int>("EmployeeId").HasColumnType("int(11)");
                        j.IndexerProperty<int>("ApprovalRequestId").HasColumnType("int(11)");
                    });

            entity.HasMany(d => d.Projects).WithMany(p => p.Employees)
                .UsingEntity<Dictionary<string, object>>(
                    "EmployeeProject",
                    r => r.HasOne<Project>().WithMany()
                        .HasForeignKey("ProjectId")
                        .HasConstraintName("FK_EmployeeProject_Project"),
                    l => l.HasOne<Employee>().WithMany()
                        .HasForeignKey("EmployeeId")
                        .HasConstraintName("FK_EmployeeProject_Employee"),
                    j =>
                    {
                        j.HasKey("EmployeeId", "ProjectId")
                            .HasName("PRIMARY")
                            .HasAnnotation("MySql:IndexPrefixLength", new[] { 0, 0 });
                        j.ToTable("employee_project");
                        j.HasIndex(new[] { "ProjectId" }, "FK_EmployeeProject_Project");
                        j.IndexerProperty<int>("EmployeeId")
                            .HasColumnType("int(11)")
                            .HasColumnName("EmployeeID");
                        j.IndexerProperty<int>("ProjectId")
                            .HasColumnType("int(11)")
                            .HasColumnName("ProjectID");
                    });
        });

        modelBuilder.Entity<Leaverequest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("leaverequests");

            entity.HasIndex(e => e.Employee, "Employee");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("ID");
            entity.Property(e => e.AbsenceReason).HasMaxLength(100);
            entity.Property(e => e.Comment).HasColumnType("text");
            entity.Property(e => e.Employee).HasColumnType("int(11)");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'New'")
                .HasColumnType("enum('New','Submitted','Cancelled')");

            entity.HasOne(d => d.EmployeeNavigation).WithMany(p => p.Leaverequests)
                .HasForeignKey(d => d.Employee)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("leaverequests_ibfk_1");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("projects");

            entity.HasIndex(e => e.ProjectManager, "ProjectManager");

            entity.Property(e => e.Id)
                .HasColumnType("int(11)")
                .HasColumnName("ID");
            entity.Property(e => e.Comment).HasColumnType("text");
            entity.Property(e => e.ProjectManager).HasColumnType("int(11)");
            entity.Property(e => e.ProjectType).HasMaxLength(50);
            entity.Property(e => e.Status).HasColumnType("enum('Active','Inactive')");

            entity.HasOne(d => d.ProjectManagerNavigation).WithMany(p => p.ProjectsNavigation)
                .HasForeignKey(d => d.ProjectManager)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("projects_ibfk_1");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
