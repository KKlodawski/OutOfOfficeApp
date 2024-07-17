using System;
using System.Collections.Generic;

namespace api.models;

public partial class Approvalrequest
{
    public int Id { get; set; }

    public int? Approver { get; set; }

    public int LeaveRequest { get; set; }

    public string Status { get; set; } = null!;

    public string? Comment { get; set; }

    public virtual Employee ApproverNavigation { get; set; } = null!;

    public virtual Leaverequest LeaveRequestNavigation { get; set; } = null!;

    public virtual ICollection<Employee?> Employees { get; } = new List<Employee?>();
}
