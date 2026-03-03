import { DyteMeeting } from '@dytesdk/react-ui-kit';
import { useDyteMeeting } from '@dytesdk/react-web-core';

export default function DyteMeetingComponent() {
    const { meeting } = useDyteMeeting();

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <DyteMeeting mode="fill" meeting={meeting} showSetupScreen={true} />
        </div>
    );
}
