const UnitType = {
    GRAMS: 'grams',
    MILLILITERS: 'milliliters',
    LITERS: 'liters'
};

// Function to convert to imperial units
const convertToImperial = (value, unit) => {
    const conversions = {
        [UnitType.GRAMS]: value * 0.03527396, // grams to ounces
        [UnitType.MILLILITERS]: value * 0.033814, // milliliters to fluid ounces
        [UnitType.LITERS]: value * 1.056688, // liters to quarts
    };

    return conversions[unit];
};