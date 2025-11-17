// tipos de navegação (RootStackParamList)
export type RootStackParamList = {
  Home: undefined; // se usar navegação
  Emergency: { id: number; tab?: 'details' | 'location' | 'help' };
};
