export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'needs_more_info';

export interface ApplicationData {
	fullName: string;
	dateOfBirth: string;
	idDocumentType: string;
	idDocumentNumber: string;
	identificationUrl: string;
	residentialAddress: string;
}

export interface Application {
	id: string;
	user_id: string;
	application_data: ApplicationData;
	status: ApplicationStatus;
	created_at: string;
	admin_remarks: string | null;
	reviewed_by: string | null;
	reviewed_at: string | null;
	updated_at: string;
	user: {
		id: string;
		name: string;
		email: string;
		avatar_url?: string | null;
	};
	reviewer?: {
		id: string;
		name: string;
		email: string;
		avatar_url: string;
	};
}

export interface ApplicationResponse {
	data: Application;
}
