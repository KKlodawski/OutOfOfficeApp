using System;
using System.Collections.Generic;

namespace api.models;

public partial class Employee
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string Subdivision { get; set; } = null!;

    public string Position { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int? PeoplePartner { get; set; }

    public int OutOfOfficeBalance { get; set; }

    public string? Photo { get; set; }

    public virtual ICollection<Approvalrequest> Approvalrequests { get; } = new List<Approvalrequest>();

    public virtual ICollection<Employee> InversePeoplePartnerNavigation { get; } = new List<Employee>();

    public virtual ICollection<Leaverequest> Leaverequests { get; } = new List<Leaverequest>();

    public virtual Employee? PeoplePartnerNavigation { get; set; }

    public virtual ICollection<Project> ProjectsNavigation { get; } = new List<Project>();

    public virtual ICollection<Approvalrequest> ApprovalRequests { get; } = new List<Approvalrequest>();

    public virtual ICollection<Project> Projects { get; } = new List<Project>();
}
