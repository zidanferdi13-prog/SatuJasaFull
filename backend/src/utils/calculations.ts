export class PriceCalculation {
  static calculateFinalPrice(
    basePrice: number,
    marginPercentage: number,
    discountAmount: number = 0,
  ): { basePrice: number; marginAmount: number; finalPrice: number } {
    const marginAmount = (basePrice * marginPercentage) / 100;
    const subtotal = basePrice + marginAmount;
    const finalPrice = Math.max(0, subtotal - discountAmount);

    return {
      basePrice,
      marginAmount,
      finalPrice,
    };
  }

  static calculateMargin(finalPrice: number, marginAmount: number): number {
    if (finalPrice === 0) return 0;
    return (marginAmount / finalPrice) * 100;
  }
}
