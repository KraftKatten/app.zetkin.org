import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { FormattedMessage as Msg } from 'react-intl';
import { Grid, LinearProgress, Typography } from '@material-ui/core';

import JourneyInstanceLayout from 'layout/organize/JourneyInstanceLayout';
import { journeyInstanceResource } from 'api/journeys';
import JourneyMilestoneCard from 'components/organize/journeys/JourneyMilestoneCard';
import { PageWithLayout } from 'types';
import { scaffold } from 'utils/next';
import { ZetkinJourneyInstance } from 'types/zetkin';
import {
  getJourneyInstanceScaffoldProps,
  JourneyDetailsPageProps,
  scaffoldOptions,
} from '../index';

export const getServerSideProps: GetServerSideProps = scaffold(
  getJourneyInstanceScaffoldProps,
  scaffoldOptions
);

const JourneyMilestonesPage: PageWithLayout<JourneyDetailsPageProps> = ({
  instanceId,
  orgId,
}) => {
  const { useQuery } = journeyInstanceResource(orgId, instanceId);
  const journeyInstanceQuery = useQuery();
  const journeyInstance = journeyInstanceQuery.data as ZetkinJourneyInstance;

  const percentCompleted = journeyInstance.milestones
    ? Math.floor(
        (journeyInstance.milestones?.filter((milestone) => milestone.completed)
          .length /
          journeyInstance.milestones?.length) *
          100
      )
    : 0;

  return (
    <>
      <Head>
        <title>
          {`${journeyInstance.title || journeyInstance.journey.title} #${
            journeyInstance.id
          }`}
        </title>
      </Head>
      <Grid container justifyContent="space-between" spacing={2}>
        <Grid item md={6}>
          {journeyInstance.milestones ? (
            <>
              <Typography
                style={{
                  padding: '1rem 0 1rem 0',
                }}
                variant="h4"
              >
                {`${percentCompleted}% `}
                <Msg id="pages.organizeJourneyInstance.complete" />
              </Typography>
              <LinearProgress value={percentCompleted} variant="determinate" />
              {journeyInstance.milestones.map((milestone, index) => (
                <JourneyMilestoneCard key={index} milestone={milestone} />
              ))}
            </>
          ) : (
            <Typography data-testid="JourneyMilestoneCard-noMilestonesMessage">
              <Msg id="pages.organizeJourneyInstance.noMilestonesMessage" />
            </Typography>
          )}
        </Grid>
      </Grid>
    </>
  );
};

JourneyMilestonesPage.getLayout = function getLayout(page) {
  return <JourneyInstanceLayout>{page}</JourneyInstanceLayout>;
};

export default JourneyMilestonesPage;
