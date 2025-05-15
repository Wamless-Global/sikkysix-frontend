export default function SuspenseFallback({ message }: { message?: string }) {
	if (message) {
		return <div className="flex justify-center items-center h-screen">{message}</div>;
	} else {
		return <div className="flex justify-center items-center h-screen">Loading details...</div>;
	}
}
