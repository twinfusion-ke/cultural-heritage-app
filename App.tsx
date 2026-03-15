/**
 * Cultural Heritage Centre — Mobile App
 * Minimal startup — no complex deps until proven stable.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

function HomeTab() {
  return (
    <View style={s.screen}>
      <Text style={s.label}>ARUSHA, TANZANIA — EST. 1994</Text>
      <Text style={s.title}>Cultural Heritage{'\n'}Centre</Text>
      <View style={s.line} />
      <Text style={s.sub}>Where Art, Heritage & Discovery Converge</Text>
    </View>
  );
}

function MarketTab() {
  return (
    <View style={[s.screen, { backgroundColor: '#3D2B1F' }]}>
      <Text style={[s.label, { color: '#D4813B' }]}>CULTURAL HERITAGE</Text>
      <Text style={s.title}>The Market</Text>
      <View style={[s.line, { backgroundColor: '#D4813B' }]} />
      <Text style={s.sub}>Handcrafts, spices, textiles & artifacts</Text>
    </View>
  );
}

function VaultTab() {
  return (
    <View style={[s.screen, { backgroundColor: '#0A0A14' }]}>
      <Text style={[s.label, { color: '#1E2F97' }]}>EST. TANZANIA</Text>
      <Text style={s.title}>The Vault</Text>
      <View style={[s.line, { backgroundColor: '#1E2F97' }]} />
      <Text style={s.sub}>Rare gemstones & fine jewelry</Text>
    </View>
  );
}

function GalleryTab() {
  return (
    <View style={[s.screen, { backgroundColor: '#1A1A1A' }]}>
      <Text style={[s.label, { color: '#C5A059' }]}>CULTURAL HERITAGE</Text>
      <Text style={s.title}>Art Gallery</Text>
      <View style={s.line} />
      <Text style={s.sub}>Contemporary & traditional fine art</Text>
    </View>
  );
}

function MoreTab() {
  return (
    <View style={[s.screen, { backgroundColor: '#F5F2ED' }]}>
      <Text style={[s.title, { color: '#0e382c' }]}>More</Text>
      <Text style={[s.sub, { color: '#666' }]}>Settings, legal, profile</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0e382c' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0e382c" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#0e382c', borderTopWidth: 0, height: 60, paddingBottom: 8 },
            tabBarActiveTintColor: '#C5A059',
            tabBarInactiveTintColor: '#888',
            tabBarLabelStyle: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
          }}
        >
          <Tab.Screen name="Home" component={HomeTab} options={{ tabBarLabel: 'Home' }} />
          <Tab.Screen name="Market" component={MarketTab} options={{ tabBarLabel: 'Market' }} />
          <Tab.Screen name="Vault" component={VaultTab} options={{ tabBarLabel: 'Vault' }} />
          <Tab.Screen name="Gallery" component={GalleryTab} options={{ tabBarLabel: 'Gallery' }} />
          <Tab.Screen name="More" component={MoreTab} options={{ tabBarLabel: 'More' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0e382c', justifyContent: 'center', alignItems: 'center', padding: 32 },
  label: { fontSize: 10, letterSpacing: 3, color: '#C5A059', textTransform: 'uppercase', marginBottom: 20 },
  title: { fontSize: 36, color: '#F5F2ED', textAlign: 'center', lineHeight: 42 },
  line: { width: 50, height: 1, backgroundColor: '#C5A059', marginVertical: 20 },
  sub: { fontSize: 13, color: 'rgba(245,242,237,0.5)', textAlign: 'center', lineHeight: 20 },
});
