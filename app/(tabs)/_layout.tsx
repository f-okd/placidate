import { useAuth } from '@/providers/AuthProvider';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name='home'
              size={24}
              color={focused ? 'black' : 'gray'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name='search'
              size={24}
              color={focused ? 'black' : 'gray'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='newPost'
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <FontAwesome6
              name='plus'
              size={24}
              color={focused ? 'black' : 'gray'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='inbox'
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <SimpleLineIcons
              name='envelope-letter'
              size={24}
              color={focused ? 'black' : 'gray'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={'profile'}
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name='person'
              size={24}
              color={focused ? 'black' : 'gray'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
