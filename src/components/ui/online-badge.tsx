export default function OnlineBadge({ online }: { online: boolean }) {
	return (
		<span className={`ml-2 text-xs font-semibold flex items-center gap-1 ${online ? 'text-green-600' : 'text-gray-500 dark:text-red-400'}`} title={online ? 'Online' : 'Offline'}>
			<span className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-400 dark:bg-red-300'}`}></span>
			{online ? 'Online' : 'Offline'}
		</span>
	);
}

{
	/* <span className={`ml-2 text-xs font-semibold flex items-center gap-1 ${counterpartOnline === 'online' ? 'text-green-600' : 'text-amber-500 dark:text-amber-400'}`} title={counterpartOnline === 'online' ? 'Online' : 'Away'}>
	<span className={`inline-block w-2 h-2 rounded-full ${counterpartOnline === 'online' ? 'bg-green-500' : 'bg-amber-400 dark:bg-amber-300'}`}></span>
	{counterpartOnline === 'online' ? 'Online' : 'Away'}
</span> */
}
