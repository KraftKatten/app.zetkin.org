import { Close } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  CircularProgress,
  InputBase,
  List,
  ListItem,
  ListSubheader,
  Paper,
  Popper,
  Theme,
  Typography,
  useAutocomplete,
} from '@mui/material';
import { FC, HTMLAttributes, useEffect, useRef, useState } from 'react';

import { useMessages } from 'core/i18n';
import { usePersonSelect } from './ZUIPersonSelect';
import { ZetkinPerson } from 'utils/types/zetkin';
import ZUIAvatar from 'zui/ZUIAvatar';

import messageIds from './l10n/messageIds';

const ZUIPersonGridEditCell: FC<{
  cell?: (Partial<Omit<ZetkinPerson, 'id'>> & { id: number | null }) | null;
  onUpdate: (person: ZetkinPerson | null) => void;
  removePersonLabel: string;
  restrictedMode?: boolean;
  suggestedPeople: ZetkinPerson[];
  suggestedPeopleLabel: string;
}> = ({
  cell,
  onUpdate,
  removePersonLabel,
  restrictedMode: isRestrictedMode = false,
  suggestedPeople,
  suggestedPeopleLabel,
}) => {
  const messages = useMessages(messageIds);

  const query = useRouter().query;
  const styles = useStyles({ isRestrictedMode });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searching, setSearching] = useState(false);
  const orgId = parseInt(query.orgId as string);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const personSelect = usePersonSelect({
    initialValue: '',
    onChange: (person) => {
      onUpdate(person);
      setSearching(false);
      setAnchorEl(null);
    },
    selectedPerson: null,
  });

  const autoComplete = useAutocomplete({
    ...personSelect.autoCompleteProps,
    disabled: isRestrictedMode,
  });

  let searchResults = autoComplete.groupedOptions as ZetkinPerson[];
  const showSuggestedPeople =
    !!suggestedPeople.length && (!cell?.id || searching);

  if (searchResults.length) {
    // Filter down suggestedPeople to only include search matches
    const matchingIds = searchResults.map((person) => person.id);
    suggestedPeople = suggestedPeople.filter((person) =>
      matchingIds.includes(person.id)
    );

    // Filter search results to exclude suggested people
    searchResults = searchResults.filter(
      (p) => !suggestedPeople.find((s) => s.id == p.id)
    );
  }

  // Filter if the input value exists in suggested people list
  const filteredSuggestedPeople =
    personSelect.autoCompleteProps.inputValue === ''
      ? suggestedPeople
      : suggestedPeople.filter(
          (p) =>
            p.first_name
              .toLocaleLowerCase()
              .includes(autoComplete.inputValue.toLocaleLowerCase()) ||
            p.last_name
              .toLocaleLowerCase()
              .includes(autoComplete.inputValue.toLocaleLowerCase()) ||
            p.email
              ?.toLocaleLowerCase()
              .includes(autoComplete.inputValue.toLocaleLowerCase())
        );

  // Scroll (if necessary) when navigating using keyboard
  useEffect(() => {
    const listElem = listRef.current;
    const suggestedPeopleIndex = activeIndex + 1;
    const searchResultsIndex = activeIndex + 1 - suggestedPeople.length;

    if (listElem) {
      //const bottomOffset = listElem.scrollTop + listElem.clientHeight;

      // Get element in list, either among the suggestedPeople or the searchResults
      const itemElem =
        suggestedPeopleIndex < suggestedPeople.length + 1
          ? (listElem.children[suggestedPeopleIndex] as HTMLElement)
          : (listElem.children[suggestedPeople.length + 1].children[
              searchResultsIndex
            ] as HTMLElement);

      // TODO: Add appropriate scroll

      const listRect = listElem.getBoundingClientRect();
      const itemRect = itemElem.getBoundingClientRect();

      //console.log('List rectangle: ' + listRect.bottom);
      //console.log('Item rectangle: ' + itemRect.bottom);

      // Item below scroller
      if (itemRect.bottom > listRect.bottom) {
        const diff = itemRect.bottom - listRect.bottom;
        listElem.scrollTop += diff;
      }

      // Item above scroller
      /*if (itemRect.bottom < listRect.top) {
        console.log('Above!');
        const diff = itemRect.top - listRect.top;
        listElem.scrollTop += diff;
      }*/
    }
  }, [listRef, activeIndex]);

  return (
    <Box
      onKeyDown={(ev) => {
        if (filteredSuggestedPeople.length + searchResults.length > 0) {
          if (ev.code == 'ArrowUp') {
            const nextIndex = activeIndex - 1;
            setActiveIndex(
              nextIndex >= 0
                ? nextIndex
                : filteredSuggestedPeople.length + searchResults.length - 1
            );
          } else if (ev.code == 'ArrowDown') {
            const nextIndex = activeIndex + 1;
            setActiveIndex(
              nextIndex < filteredSuggestedPeople.length + searchResults.length
                ? nextIndex
                : 0
            );
          } else if (ev.code == 'Enter') {
            if (activeIndex < filteredSuggestedPeople.length) {
              onUpdate(filteredSuggestedPeople[activeIndex]);
            } else {
              onUpdate(
                searchResults[activeIndex - filteredSuggestedPeople.length]
              );
            }
          }
        }
      }}
      onMouseEnter={(ev) => {
        setAnchorEl(ev.currentTarget);
      }}
      onMouseLeave={() => {
        setAnchorEl(null);
      }}
    >
      <Box ref={(div: HTMLDivElement) => setAnchorEl(div)}>
        <InputBase
          /* eslint-disable-next-line jsx-a11y/no-autofocus */
          autoFocus
          fullWidth
          inputProps={autoComplete.getInputProps()}
          onChange={() => setSearching(true)}
          placeholder={messages.personSelect.search()}
          sx={{ paddingLeft: '10px' }}
        />
      </Box>

      {suggestedPeople.length || autoComplete.inputValue != '' ? (
        <Popper
          anchorEl={anchorEl}
          open={!!anchorEl}
          popperOptions={{
            placement: 'bottom',
          }}
        >
          <Paper
            className={styles.popper}
            elevation={2}
            onClick={(ev) => {
              ev.stopPropagation();
              anchorEl?.focus();
            }}
          >
            {isRestrictedMode && (
              <Box
                alignItems="center"
                display="flex"
                flexDirection="column"
                gap={1}
                justifyContent="center"
                width="100%"
              >
                {!!cell && (
                  <SelectedPerson orgId={orgId} person={cell as ZetkinPerson} />
                )}
                <Typography fontStyle="italic" variant="caption">
                  {messages.personGridEditCell.restrictedMode()}
                </Typography>
              </Box>
            )}
            {!isRestrictedMode && (
              <Box display="flex" flexDirection="column" height="100%">
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    height: 'calc(100% - 10px)',
                    justifyContent: 'center',
                    minWidth: '290px',
                    width: '100%',
                  }}
                >
                  {!!cell?.id && (
                    <Box
                      alignItems="center"
                      display="flex"
                      flexDirection="column"
                      gap={1}
                      justifyContent="center"
                    >
                      {!isRestrictedMode && !searching && (
                        <>
                          <SelectedPerson
                            orgId={orgId}
                            person={cell as ZetkinPerson}
                          />
                          <Button
                            endIcon={<Close />}
                            onClick={() => onUpdate(null)}
                            sx={{
                              cursor: 'pointer',
                            }}
                          >
                            {removePersonLabel}
                          </Button>
                        </>
                      )}
                    </Box>
                  )}
                  <List
                    ref={listRef}
                    className={styles.searchingList}
                    sx={{
                      display:
                        showSuggestedPeople || searching ? 'block' : 'none',
                    }}
                  >
                    {showSuggestedPeople && filteredSuggestedPeople.length > 0 && (
                      <>
                        <ListSubheader
                          disableSticky={true}
                          sx={{ marginTop: 0, paddingTop: 0 }}
                        >
                          {suggestedPeopleLabel}
                        </ListSubheader>
                        {filteredSuggestedPeople.map((option, index) => (
                          <PersonListItem
                            key={option.id}
                            itemProps={{
                              onClick: () => {
                                onUpdate(option);
                              },
                            }}
                            orgId={orgId}
                            person={option}
                            selected={
                              activeIndex < filteredSuggestedPeople.length &&
                              index == activeIndex
                            }
                          />
                        ))}
                      </>
                    )}
                    {searching && (
                      <List
                        {...autoComplete.getListboxProps()}
                        subheader={
                          <ListSubheader sx={{ position: 'relative' }}>
                            {searchResults.length > 0 &&
                              messages.personGridEditCell.searchResults()}
                            {autoComplete.inputValue &&
                              searchResults.length === 0 &&
                              autoComplete.inputValue.length < 3 &&
                              autoComplete.inputValue.length > 0 &&
                              messages.personGridEditCell.keepTyping()}
                            {autoComplete.inputValue.length >= 3 &&
                              !personSelect.autoCompleteProps.isLoading &&
                              searchResults.length === 0 &&
                              messages.personGridEditCell.noResult()}
                          </ListSubheader>
                        }
                      >
                        {personSelect.autoCompleteProps.isLoading && (
                          <CircularProgress
                            sx={{ display: 'block', margin: 'auto' }}
                          />
                        )}

                        {searchResults.map((option, index) => {
                          const optProps = autoComplete.getOptionProps({
                            index,
                            option,
                          });
                          return (
                            <PersonListItem
                              key={option.id}
                              itemProps={optProps}
                              orgId={orgId}
                              person={option}
                              selected={
                                index + filteredSuggestedPeople.length ==
                                activeIndex
                              }
                            />
                          );
                        })}
                      </List>
                    )}
                  </List>
                </Box>
              </Box>
            )}
          </Paper>
        </Popper>
      ) : (
        <></>
      )}
    </Box>
  );
};

const PersonListItem: FC<{
  itemProps: HTMLAttributes<HTMLLIElement>;
  orgId: number;
  person: ZetkinPerson;
  selected: boolean;
}> = ({ itemProps, orgId, person, selected }) => {
  return (
    <ListItem
      {...itemProps}
      disablePadding
      selected={selected}
      sx={{ paddingBottom: 0.5, paddingTop: 0.5 }}
    >
      <Box
        sx={{
          cursor: 'pointer',
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
        }}
      >
        <ZUIAvatar orgId={orgId} personId={person.id} size="sm" />
        <Typography component="span">
          {`${person.first_name} ${person.last_name}`}
        </Typography>
      </Box>
    </ListItem>
  );
};

const SelectedPerson: FC<{ orgId: number; person: ZetkinPerson }> = ({
  orgId,
  person,
}) => {
  return (
    <>
      <ZUIAvatar orgId={orgId} personId={person.id} size="lg" />
      <Typography>{`${person.first_name} ${person.last_name}`}</Typography>
    </>
  );
};

const useStyles = makeStyles<Theme, { isRestrictedMode: boolean }>({
  popper: {
    display: 'flex',
    flexDirection: 'column',
    height: (props) => (props.isRestrictedMode ? 'auto' : 400),
    width: 300,
  },
  searchingList: {
    height: 'calc(100% - 40px)',
    minWidth: '250px',
    overflowY: 'scroll',
    paddingLeft: '20px',
    position: 'absolute',
    width: '100%',
  },
});

export default ZUIPersonGridEditCell;
