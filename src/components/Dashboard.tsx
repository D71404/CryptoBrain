
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsTab } from './NewsTab';
import { StatsTab } from './StatsTab';
import { KnowledgeTab } from './KnowledgeTab';
import { SmartSearchTab } from './SmartSearchTab';

export const Dashboard = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CryptoHub
          </h1>
          <p className="text-slate-300 text-lg">Your comprehensive crypto intelligence platform</p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-black/20 backdrop-blur-sm border border-white/10">
            <TabsTrigger 
              value="news" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
            >
              📰 News
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
            >
              📊 Stats
            </TabsTrigger>
            <TabsTrigger 
              value="knowledge"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
            >
              🧠 Knowledge
            </TabsTrigger>
            <TabsTrigger 
              value="smart-search"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300"
            >
              🔍 Smart Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="mt-0">
            <NewsTab />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <StatsTab />
          </TabsContent>
          
          <TabsContent value="knowledge" className="mt-0">
            <KnowledgeTab />
          </TabsContent>
          
          <TabsContent value="smart-search" className="mt-0">
            <SmartSearchTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
