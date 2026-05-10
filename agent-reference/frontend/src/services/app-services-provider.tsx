import * as React from 'react';

import {
  AuthProvider,
  CommentStore,
  DiscussionStore,
  FlagProvider,
  Monitor,
  TeamStore,
  UserStore,
} from '@/ports';

export type AppServices = {
  auth: AuthProvider;
  teams: TeamStore;
  users: UserStore;
  discussions: DiscussionStore;
  comments: CommentStore;
  flags: FlagProvider;
  monitor: Monitor;
};

const AppServicesContext = React.createContext<AppServices | null>(null);

export const AppServicesProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AppServices;
}) => {
  return (
    <AppServicesContext.Provider value={value}>
      {children}
    </AppServicesContext.Provider>
  );
};

export const useServices = () => {
  const services = React.useContext(AppServicesContext);
  if (!services) {
    throw new Error('AppServicesProvider is missing');
  }
  return services;
};
