export function outstandingBalance(totalPricePaise, verifiedPaymentPaise) {
  const total = Number.isSafeInteger(totalPricePaise) ? totalPricePaise : 0;
  const paid = Number.isSafeInteger(verifiedPaymentPaise) ? verifiedPaymentPaise : 0;
  return Math.max(0, total - paid);
}

export function calculateProjectProgress(milestones) {
  if (!Array.isArray(milestones) || milestones.length === 0) return 0;
  const totalWeight = milestones.reduce((sum, milestone) => sum + Math.max(1, Number(milestone.price_paise) || 0), 0);
  const weightedProgress = milestones.reduce((sum, milestone) => {
    const progress = milestone.work_status === "completed" ? 100 : Math.min(100, Math.max(0, Number(milestone.work_percent) || 0));
    return sum + progress * Math.max(1, Number(milestone.price_paise) || 0);
  }, 0);
  return Math.round(weightedProgress / totalWeight);
}

export function formatINRFromPaise(value) {
  const paise = Number.isSafeInteger(value) ? value : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}
