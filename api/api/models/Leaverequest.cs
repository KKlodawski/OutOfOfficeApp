using System;
using System.Collections.Generic;

namespace api.models;

public partial class Leaverequest
{
    public int Id { get; set; }

    public int Employee { get; set; }

    public string AbsenceReason { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public string? Comment { get; set; }

    public string Status { get; set; } = null!;

    public virtual ICollection<Approvalrequest> Approvalrequests { get; } = new List<Approvalrequest>();

    public virtual Employee EmployeeNavigation { get; set; } = null!;
}
