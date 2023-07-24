import { createStore } from "solid-js/store";
import {
  createContext,
  JSX,
  useContext
} from "solid-js";
import {
  FeedPage,
  NostrEventContent,
  NostrMentionContent,
  NostrNoteActionsContent,
  NostrNoteContent,
  NostrStatsContent,
  NostrUserContent,
  NoteActions,
  PrimalNote,
  PrimalUser,
} from '../types/primal';
import { Kind } from "../constants";
import { APP_ID } from "../App";
import { getUserProfiles } from "../lib/profile";
import { searchContent, searchUsers } from "../lib/search";
import { convertToUser } from "../stores/profile";
import { sortByRecency, convertToNotes } from "../stores/note";
import { subscribeTo } from "../sockets";
import { nip19 } from "nostr-tools";

// TODO: change these
const recomendedUsers = [
  '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // jack
  // '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // preston
  // '2250f69694c2a43929e77e5de0f6a61ae5e37a1ee6d6a3baef1706ed9901248b', // wavlake
  // 'd10f938e98e9d20ccd7972fdc61554a875a67008dd6e8b11988b1e2e01f44889', // gesso
  // '6538925ebfb661f418d8c7d074bee2e8afd778701dd89070c2da936d571e55c3', // fountain
  // '8c1cc556422beaa4c7b4fed32c458384560762a37629991d278b1f0686a60fcc', // mathg
  // '59f97730b917e0e4bcbcd65309dbee76bf1d94339ec590256c037f50fdfbfb14', // miss el salvador
  // 'eab0e756d32b80bcd464f3d844b8040303075a13eabc3599a762c9ac7ab91f4f', // lyn
  // '11b2d93b26d7e56fb57f0afce0d33bfa7fb35b913e4c0aeb7706464befb9ca97', // mia
  // '84dee6e676e5bb67b4ad4e042cf70cbd8681155db535942fcc6a0533858a7240', // edward snowden
  // '6774223d1b19dc15454733ab7559acde1d21fdf3fe9b2652c463c7fadb12c042', // tech crunch
  // '55f04590674f3648f4cdc9dc8ce32da2a282074cd0b020596ee033d12d385185', // nogood
];

export type SearchContextStore = {
  contentQuery: string,
  users: PrimalUser[],
  scores: Record<string, number>,
  contentUsers: PrimalUser[],
  contentScores: Record<string, number>,
  notes: PrimalNote[],
  isFetchingUsers: boolean,
  isFetchingContent: boolean,
  page: FeedPage,
  reposts: Record<string, string> | undefined,
  mentionedNotes: Record<string, NostrNoteContent>,
  actions: {
    findUsers: (query: string, pubkey?: string) => void,
    findUserByNupub: (npub: string) => void,
    findContentUsers: (query: string, pubkey?: string) => void,
    findContent: (query: string) => void,
    setContentQuery: (query: string) => void,
    getRecomendedUsers: () => void,
  },
}

const initialData = {
  contentQuery: '',
  users: [],
  scores: {},
  contentUsers: [],
  contentScores: {},
  notes: [],
  isFetchingUsers: false,
  isFetchingContent: false,
  page: { messages: [], users: {}, postStats: {}, mentions: {}, noteActions: {} },
  reposts: {},
  mentionedNotes: {},
};

export const SearchContext = createContext<SearchContextStore>();

export function SearchProvider(props: { children: number | boolean | Node | JSX.ArrayElement | JSX.FunctionElement | (string & {}) | null | undefined; }) {

// ACTIONS --------------------------------------

  const findUserByNupub = (npub: string) => {
    const subId = `find_npub_${APP_ID}`;

    let decoded: nip19.DecodeResult | undefined;

    try {
      decoded = nip19.decode(npub);
    } catch (e) {
      findUsers(npub);
      return;
    }

    if (!decoded) {
      findUsers(npub);
      return;
    }

    const hex = typeof decoded.data === 'string' ?
      decoded.data :
      (decoded.data as nip19.ProfilePointer).pubkey;

    let users: PrimalUser[] = [];

    const unsub = subscribeTo(subId, (type, _, content) => {
      if (type === 'EVENT') {
        if (!content) {
          return;
        }

        if (content.kind === Kind.Metadata) {
          const user = content as NostrUserContent;

          users.push(convertToUser(user));
          return;
        }

        if (content.kind === Kind.UserScore) {
          const scores = JSON.parse(content.content);

          updateStore('scores', () => ({ ...scores }));
          return;
        }
      }

      if (type === 'EOSE') {

        if (users.length > 0) {
          updateStore('users', () => [users[0]]);
        }

        updateStore('isFetchingUsers', () => false);

        unsub();
        return;
      }
    });

    getUserProfiles([hex], subId);
  };

  const getRecomendedUsers = () => {
    const subid = `recomended_users_${APP_ID}`;

    let users: PrimalUser[] = [];

    const unsub = subscribeTo(subid, (type, _, content) => {
      if (type === 'EVENT') {
        if (!content) {
          return;
        }

        if (content.kind === Kind.Metadata) {
          const user = content as NostrUserContent;

          users.push(convertToUser(user));
          return;
        }

        if (content.kind === Kind.UserScore) {
          const scores = JSON.parse(content.content);

          updateStore('scores', () => ({ ...scores }));
          return;
        }
      }

      if (type === 'EOSE') {

        let sorted: PrimalUser[] = [];

        users.forEach((user) => {
          const index = recomendedUsers.indexOf(user.pubkey);
          sorted[index] = { ...user };
        });

        updateStore('users', () => sorted);
        updateStore('isFetchingUsers', () => false);

        unsub();
        return;
      }
    });


    updateStore('isFetchingUsers', () => true);
    getUserProfiles(recomendedUsers, subid);

  };

  const findUsers = (query: string, publicKey?: string) => {
    const subid = `search_users_${APP_ID}`;

    let users: PrimalUser[] = [];

    const unsub = subscribeTo(subid, (type, _, content) => {
      if (type === 'EVENT') {
        if (!content) {
          return;
        }

        if (content.kind === Kind.Metadata) {
          const user = content as NostrUserContent;

          users.push(convertToUser(user));
          return;
        }

        if (content.kind === Kind.UserScore) {
          const scores = JSON.parse(content.content);

          updateStore('scores', () => ({ ...scores }));
          return;
        }
      }

      if (type === 'EOSE') {
        const sorted = users.sort((a, b) => {
          const aScore = store.scores[a.pubkey];
          const bScore = store.scores[b.pubkey];

          return bScore - aScore;
        });

        updateStore('users', () => sorted.slice(0, 10));
        updateStore('isFetchingUsers', () => false);

        unsub();
        return;
      }

    });

    const pubkey = query.length > 0 ? undefined : publicKey;

    updateStore('isFetchingUsers', () => true);
    searchUsers(pubkey, subid, query);
  }

  const findContentUsers = (query: string, publicKey?: string) => {
    const subid = `search_users_c_${APP_ID}`;

    let users: PrimalUser[] = [];

    const unsub = subscribeTo(subid, (type, _, content) => {
      if (type === 'EVENT') {
        if (!content) {
          return;
        }

        if (content.kind === Kind.Metadata) {
          const user = content as NostrUserContent;

          users.push(convertToUser(user));
          return;
        }

        if (content.kind === Kind.UserScore) {
          const scores = JSON.parse(content.content);

          updateStore('contentScores', () => ({ ...scores }));
          return;
        }
      }

      if (type === 'EOSE') {
        const sorted = users.sort((a, b) => {
          const aScore = store.scores[a.pubkey];
          const bScore = store.scores[b.pubkey];

          return bScore - aScore;
        });

        updateStore('contentUsers', () => sorted.slice(0, 10));

        unsub();
        return;
      }

    });

    const pubkey = query.length > 0 ? undefined : publicKey;

    updateStore('isFetchingUsers', () => true);
    searchUsers(pubkey, subid, query);
  }

  const saveNotes = (newNotes: PrimalNote[]) => {
    updateStore('notes', () => [ ...newNotes ]);
    updateStore('isFetchingContent', () => false);
  };


  const updatePage = (content: NostrEventContent) => {
    if (content.kind === Kind.Metadata) {
      const user = content as NostrUserContent;

      updateStore('page', 'users',
        (usrs) => ({ ...usrs, [user.pubkey]: { ...user } })
      );
      return;
    }

    if ([Kind.Text, Kind.Repost].includes(content.kind)) {
      const message = content as NostrNoteContent;

      updateStore('page', 'messages',
        (msgs) => [ ...msgs, { ...message }]
      );

      return;
    }

    if (content.kind === Kind.NoteStats) {
      const statistic = content as NostrStatsContent;
      const stat = JSON.parse(statistic.content);

      updateStore('page', 'postStats',
        (stats) => ({ ...stats, [stat.event_id]: { ...stat } })
      );
      return;
    }

    if (content.kind === Kind.Mentions) {
      const mentionContent = content as NostrMentionContent;
      const mention = JSON.parse(mentionContent.content);

      updateStore('page', 'mentions',
        (mentions) => ({ ...mentions, [mention.id]: { ...mention } })
      );
      return;
    }

    if (content.kind === Kind.NoteActions) {
      const noteActionContent = content as NostrNoteActionsContent;
      const noteActions = JSON.parse(noteActionContent.content) as NoteActions;

      updateStore('page', 'noteActions',
        (actions) => ({ ...actions, [noteActions.event_id]: { ...noteActions } })
      );
      return;
    }
  };

  const savePage = (page: FeedPage) => {
    const newPosts = sortByRecency(convertToNotes(page));

    saveNotes(newPosts);
  };

  const findContent = (query: string) => {
    const subid = `search_content_${APP_ID}`;

    const unsub = subscribeTo(subid, (type, _, content) => {

      if (type === 'EOSE') {
        savePage(store.page);
        unsub();
        return;
      }

      if (!content) {
        return;
      }


      if (type === 'EVENT') {
        updatePage(content);
        return;
      }

    });

    updateStore('isFetchingContent', () => true);
    updateStore('notes', () => []);
    updateStore('page', { messages: [], users: {}, postStats: {}, mentions: {}, noteActions: {} })
    searchContent(subid, query);
  }

  const setContentQuery = (query: string) => {
    updateStore('contentQuery', () => query);
  };



// EFFECTS --------------------------------------

// SOCKET HANDLERS ------------------------------


// STORES ---------------------------------------

const [store, updateStore] = createStore<SearchContextStore>({
  ...initialData,
  actions: {
    findUsers,
    findUserByNupub,
    findContent,
    findContentUsers,
    setContentQuery,
    getRecomendedUsers,
  },
});

  return (
    <SearchContext.Provider value={store}>
      {props.children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() { return useContext(SearchContext); }
