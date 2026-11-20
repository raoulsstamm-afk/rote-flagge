import * as Updates from 'expo-updates';

// Test-App: alles außer dem Store-Kanal "production". Test-Werkzeuge sind in der Store-Version unsichtbar.
export const testApp = Updates.channel !== 'production';
