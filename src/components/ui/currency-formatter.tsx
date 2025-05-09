const currencyFormatter = (value: number, currency = '₦') => {
	return `${currency}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default currencyFormatter;
