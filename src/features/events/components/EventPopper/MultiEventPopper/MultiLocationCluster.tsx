import { FC } from 'react';
import { Box, Divider } from '@mui/material';

import ClusterBody from './ClusterBody';
import ClusterHeader from './ClusterHeader';
import EventDataModel from 'features/events/models/EventDataModel';
import useModel from 'core/useModel';
import { ZetkinEvent } from 'utils/types/zetkin';
import MultiEventListItem, { CLUSTER_TYPE } from './MultiEventListItem';

interface MultiLocationClusterProps {
  events: ZetkinEvent[];
  onEventClick: (id: number) => void;
}

const MultiLocationCluster: FC<MultiLocationClusterProps> = ({
  events,
  onEventClick,
}) => {
  const model = useModel(
    (env) => new EventDataModel(env, events[0].organization.id, events[0].id)
  );

  return (
    <Box>
      <ClusterHeader event={events[0]} state={model.state} />
      <ClusterBody clusterType={CLUSTER_TYPE.LOCATION} events={events} />
      <Divider />
      <Box paddingTop={1}>
        {events.map((event) => {
          return (
            <MultiEventListItem
              key={event.id}
              clusterType={CLUSTER_TYPE.LOCATION}
              compact={false}
              event={event}
              onEventClick={(id: number) => onEventClick(id)}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default MultiLocationCluster;
