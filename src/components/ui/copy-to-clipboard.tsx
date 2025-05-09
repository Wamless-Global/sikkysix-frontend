import { toast } from 'sonner';

const copyToClipboard = (text: string, successMsg: string = 'Copied successfully', errorMsg: string = 'Failed to copy') => {
	navigator.clipboard.writeText(text).then(
		() => {
			toast.success(successMsg);
		},
		(err) => {
			toast.error(errorMsg);
		}
	);
};

export default copyToClipboard;
