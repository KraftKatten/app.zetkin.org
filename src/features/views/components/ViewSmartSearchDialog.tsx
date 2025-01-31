import { FunctionComponent } from 'react';

import useModel from 'core/useModel';
import ViewDataModel from '../models/ViewDataModel';
import { ZetkinView } from 'features/views/components/types';
import SmartSearchDialog, {
  SmartSearchDialogProps,
} from 'features/smartSearch/components/SmartSearchDialog';

interface ViewSmartSearchDialogProps {
  onDialogClose: SmartSearchDialogProps['onDialogClose'];
  orgId: string | number;
  view: ZetkinView;
}

const ViewSmartSearchDialog: FunctionComponent<ViewSmartSearchDialogProps> = ({
  orgId,
  view,
  ...dialogProps
}) => {
  const model = useModel(
    (env) => new ViewDataModel(env, parseInt(orgId as string), view.id)
  );

  return (
    <SmartSearchDialog
      {...dialogProps}
      onSave={(query) => {
        model.updateContentQuery(query);
        dialogProps.onDialogClose();
      }}
      query={view.content_query}
    />
  );
};

export default ViewSmartSearchDialog;
