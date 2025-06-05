export async function fetchP2PMessages(tradeId: string) {
	const res = await fetch(`/api/messages/related/${tradeId}`);
	if (!res.ok) throw new Error('Failed to fetch messages');
	const { data } = await res.json();
	return data;
}

// POST /api/messages
export interface MessageMetadata {
	[key: string]: unknown;
}

export async function sendP2PMessage({ sender_id, recipient_id, content, message_type, related_transaction_id, metadata, imageFile }: { sender_id: string; recipient_id: string; content: string; message_type: string; related_transaction_id: string; metadata?: MessageMetadata; imageFile?: File }) {
	const formData = new FormData();
	formData.append('sender_id', sender_id);
	formData.append('recipient_id', recipient_id);
	formData.append('content', content);
	formData.append('message_type', message_type);
	formData.append('related_transaction_id', related_transaction_id);
	if (metadata)
		//  formData.append('metadata', JSON.stringify(metadata));
		console.log(metadata);

	if (imageFile) formData.append('image', imageFile);

	// for (let [key, value] of formData.entries()) {
	// 	console.log(`${key}: ${value}`);
	// }

	const res = await fetch('/api/messages', {
		method: 'POST',
		credentials: 'include',
		body: formData,
	});
	if (!res.ok) throw new Error('Failed to send message');
	const { data } = await res.json();
	return data;
}
