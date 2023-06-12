export const proposalStateMap: Record<number, string> = {
    0: "Pending",
    1: "Active",
    2: "Canceled",
    3: "Defeated",
    4: "Succeeded",
    5: "Queued",
    6: "Expired",
    7: "Executed",
};

export const badgeVariantMap: Record<
    string,
    "success" | "warning" | "destructive" | "default" | "secondary"
> = {
    Pending: "warning",
    Active: "success",
    Canceled: "destructive",
    Defeated: "destructive",
    Succeeded: "success",
    Queued: "success",
    Expired: "destructive",
    Executed: "success",
};
