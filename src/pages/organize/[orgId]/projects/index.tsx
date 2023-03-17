import { GetServerSideProps } from 'next';

import { Box } from '@mui/material';
import Head from 'next/head';
import { useQuery } from 'react-query';

import AllProjectsLayout from 'features/projects/layout/AllCampaignsLayout';
import getEvents from 'features/events/fetching/getEvents';
import getOrg from 'utils/fetching/getOrg';
import getProjects from 'features/projects/fetching/getProjects';
import getUpcomingEvents from 'features/events/fetching/getUpcomingEvents';
import { PageWithLayout } from 'utils/types';
import ProjectCard from 'features/projects/components/ProjectCard';
import { scaffold } from 'utils/next';
import { useMessages } from 'core/i18n';
import ZUISection from 'zui/ZUISection';

import messageIds from 'features/projects/l10n/messageIds';

const scaffoldOptions = {
  authLevelRequired: 2,
  localeScope: [
    'layout.organize',
    'misc.breadcrumbs',
    'pages.organizeAllCampaigns',
    'misc.formDialog',
    'misc.speedDial',
  ],
};

export const getServerSideProps: GetServerSideProps = scaffold(async (ctx) => {
  const { orgId } = ctx.params!;

  await ctx.queryClient.prefetchQuery(
    ['org', orgId],
    getOrg(orgId as string, ctx.apiFetch)
  );
  const orgState = ctx.queryClient.getQueryState(['org', orgId]);

  await ctx.queryClient.prefetchQuery(
    ['campaigns', orgId],
    getProjects(orgId as string, ctx.apiFetch)
  );
  const campaignsState = ctx.queryClient.getQueryState(['campaigns', orgId]);

  await ctx.queryClient.prefetchQuery(
    ['upcomingEvents', orgId],
    getUpcomingEvents(orgId as string, ctx.apiFetch)
  );
  const upcomingEventsState = ctx.queryClient.getQueryState([
    'upcomingEvents',
    orgId,
  ]);

  await ctx.queryClient.prefetchQuery(
    ['events', orgId],
    getEvents(orgId as string, ctx.apiFetch)
  );
  const eventsState = ctx.queryClient.getQueryState(['events', orgId]);

  if (
    orgState?.status === 'success' &&
    campaignsState?.status === 'success' &&
    eventsState?.status === 'success' &&
    upcomingEventsState?.status === 'success'
  ) {
    return {
      props: {
        orgId,
      },
    };
  } else {
    return {
      notFound: true,
    };
  }
}, scaffoldOptions);

type AllCampaignsSummaryPageProps = {
  orgId: string;
};

const AllCampaignsSummaryPage: PageWithLayout<AllCampaignsSummaryPageProps> = ({
  orgId,
}) => {
  const messages = useMessages(messageIds);
  const campaignsQuery = useQuery(['campaigns', orgId], getProjects(orgId));
  const eventsQuery = useQuery(['events', orgId], getEvents(orgId));

  const campaigns = campaignsQuery.data || [];
  const events = eventsQuery.data || [];

  return (
    <>
      <Head>
        <title>{messages.layout.allProjects()}</title>
      </Head>
      <ZUISection title={messages.all.heading()}>
        <Box
          display="grid"
          gap={20}
          gridTemplateColumns="repeat( auto-fit, minmax(450px, 1fr) )"
        >
          {campaigns.map((campaign) => {
            return (
              <ProjectCard
                key={campaign.id}
                events={events}
                project={campaign}
              />
            );
          })}
        </Box>
      </ZUISection>
    </>
  );
};

AllCampaignsSummaryPage.getLayout = function getLayout(page) {
  return <AllProjectsLayout>{page}</AllProjectsLayout>;
};

export default AllCampaignsSummaryPage;
