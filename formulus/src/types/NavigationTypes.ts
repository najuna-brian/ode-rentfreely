export type MainTabParamList = {
  Home: undefined;
  Sync: undefined;
  Settings: undefined;
  About: undefined;
  Help: undefined;
  More: { openDrawer?: number } | undefined;
};

export type MainAppStackParamList = {
  Auth: undefined;
  MainApp: undefined;
  ObservationDetail: { observationId: string };
};
