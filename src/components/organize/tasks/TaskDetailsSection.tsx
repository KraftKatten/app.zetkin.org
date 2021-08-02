import { useIntl } from 'react-intl';

import getTaskStatus from 'utils/getTaskStatus';
import { ZetkinTask } from 'types/zetkin';

import TaskProperty from './TaskProperty';
import TaskTypeDetailsSection from './TaskTypeDetailsSection';

interface TaskDetailsCardProps {
    task: ZetkinTask;
}

const TaskDetailsCard: React.FunctionComponent<TaskDetailsCardProps> = ({ task }) => {
    const intl = useIntl();
    const status = getTaskStatus(task);
    return (
        <>
            <TaskProperty
                title={ intl.formatMessage({ id: 'misc.tasks.taskDetails.statusLabel' }) }
                value={ intl.formatMessage({ id: `misc.tasks.statuses.${status}` }) }
            />
            <TaskProperty
                title={ intl.formatMessage({ id: 'misc.tasks.taskDetails.typeLabel' }) }
                value={ intl.formatMessage({ id: `misc.tasks.types.${task.type}` }) }
            />
            <TaskProperty
                title={ intl.formatMessage({ id: 'misc.tasks.taskDetails.instructionsLabel' }) }
                value={ task.instructions }
            />
            <TaskTypeDetailsSection task={ task }/>
        </>
    );
};

export default TaskDetailsCard;
