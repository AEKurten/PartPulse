import { useThemeColors } from '@/hooks/use-theme-colors';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock game FPS data
const gameFPSData: Record<string, { fps: number; settings: string }> = {
  'Cyberpunk 2077': { fps: 78, settings: 'Ultra RT' },
  'Baldur\'s Gate 3': { fps: 95, settings: 'Ultra' },
  'Alan Wake 2': { fps: 68, settings: 'High RT' },
  'The Last of Us': { fps: 82, settings: 'Ultra' },
  'Starfield': { fps: 71, settings: 'High' },
  'Hogwarts Legacy': { fps: 88, settings: 'Ultra' },
  'Call of Duty: MW3': { fps: 142, settings: 'Ultra' },
  'Fortnite': { fps: 165, settings: 'Epic' },
  'Apex Legends': { fps: 158, settings: 'Ultra' },
  'Valorant': { fps: 320, settings: 'High' },
};

const games = Object.keys(gameFPSData);

// Mock build results (in real app, this would come from AI/API)
const generateBuildResults = (budget: string, buildType: string, resolution: string) => {
  const budgetNum = parseInt(budget) || 2000;
  
  return {
    totalPrice: budgetNum * 0.95, // 95% of budget used
    estimatedPerformance: buildType === 'gaming' ? 'Ultra' : buildType === 'office' ? 'High' : 'Very High',
    parts: [
      {
        id: 1,
        name: 'AMD Ryzen 7 7800X3D',
        category: 'CPU',
        price: 449.99,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80',
        localSeller: true,
        distance: '12 miles',
        aiRecommended: true,
      },
      {
        id: 2,
        name: 'NVIDIA GeForce RTX 4070',
        category: 'GPU',
        price: 599.99,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80',
        localSeller: true,
        distance: '8 miles',
        aiRecommended: true,
      },
      {
        id: 3,
        name: '32GB DDR5-6000 RAM',
        category: 'RAM',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80',
        localSeller: false,
        aiRecommended: true,
      },
      {
        id: 4,
        name: '1TB NVMe SSD',
        category: 'Storage',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80',
        localSeller: true,
        distance: '15 miles',
        aiRecommended: true,
      },
      {
        id: 5,
        name: 'B650 Motherboard',
        category: 'Motherboard',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80',
        localSeller: false,
        aiRecommended: true,
      },
      {
        id: 6,
        name: '750W 80+ Gold PSU',
        category: 'PSU',
        price: 109.99,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=300&fit=crop&q=80',
        localSeller: true,
        distance: '20 miles',
        aiRecommended: true,
      },
    ],
  };
};

export default function AIBuilderResultsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const params = useLocalSearchParams();
  const [selectedGame, setSelectedGame] = useState(games[0]);
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [isFPSExpanded, setIsFPSExpanded] = useState(false);
  
  const buildMode = params.buildMode as string || 'new';
  const budget = params.budget as string || '2000';
  const buildType = params.buildType as string || 'gaming';
  const resolution = params.resolution as string || '2560x1440';
  const radius = params.radius as string || '50';

  const buildResults = generateBuildResults(budget, buildType, resolution);
  
  const selectedGameData = gameFPSData[selectedGame];
  const maxFPS = Math.max(...Object.values(gameFPSData).map(d => d.fps));
  const minFPS = Math.min(...Object.values(gameFPSData).map(d => d.fps));
  const fpsRange = maxFPS - minFPS;

  const buildTypeLabels: Record<string, string> = {
    gaming: 'Gaming',
    office: 'Office',
    creative: 'Creative',
    streaming: 'Streaming',
    budget: 'Budget',
    enthusiast: 'Enthusiast',
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
      <StatusBar style={colors.statusBarStyle} />
      
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textColor} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold', marginBottom: 2 }}>
            {buildMode === 'upgrade' ? 'Your AI Upgrades' : 'Your AI Build'}
          </Text>
          <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
            {buildTypeLabels[buildType] || 'Custom'} • {resolution}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: '#EC4899' + '20',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <Text style={{ color: '#EC4899', fontSize: 12, fontWeight: '600' }}>
            AI Generated
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          paddingBottom: Math.max(insets.bottom, 24) + 100,
        }}
      >
        {/* FPS Performance Graph - Only show for gaming builds */}
        {buildType === 'gaming' && (
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              marginTop: 24,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.borderColor,
            }}
          >
            {/* Collapsible Header */}
            <Pressable
              onPress={() => setIsFPSExpanded(!isFPSExpanded)}
              style={{ marginBottom: isFPSExpanded ? 20 : 0 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                    Performance Preview
                  </Text>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                    Estimated FPS at {resolution}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {!isFPSExpanded && (
                    <View>
                      <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold', textAlign: 'right' }}>
                        {gameFPSData[selectedGame]?.fps || 0} FPS
                      </Text>
                      <Text style={{ color: colors.secondaryTextColor, fontSize: 11, textAlign: 'right' }}>
                        {selectedGame}
                      </Text>
                    </View>
                  )}
                  <Ionicons 
                    name={isFPSExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={colors.secondaryTextColor} 
                  />
                </View>
              </View>
            </Pressable>

            {/* Expanded Content */}
            {isFPSExpanded && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <View
                    style={{
                      backgroundColor: '#10B981' + '20',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '600' }}>
                      {gameFPSData[selectedGame]?.settings || 'Ultra'}
                    </Text>
                  </View>
                </View>

                {/* Game Selector */}
                <View style={{ marginBottom: 24, position: 'relative', zIndex: 10 }}>
                  <Pressable
                    onPress={() => setShowGameDropdown(!showGameDropdown)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: colors.backgroundColor,
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Ionicons name="game-controller" size={20} color="#EC4899" style={{ marginRight: 12 }} />
                      <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', flex: 1 }}>
                        {selectedGame}
                      </Text>
                    </View>
                    <Ionicons 
                      name={showGameDropdown ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color={colors.secondaryTextColor} 
                    />
                  </Pressable>

                  {/* Dropdown Menu */}
                  {showGameDropdown && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 60,
                        left: 0,
                        right: 0,
                        backgroundColor: colors.cardBackground,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.borderColor,
                        maxHeight: 300,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                      }}
                    >
                      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
                        {games.map((game) => (
                          <Pressable
                            key={game}
                            onPress={() => {
                              setSelectedGame(game);
                              setShowGameDropdown(false);
                            }}
                            style={{
                              padding: 16,
                              borderBottomWidth: game !== games[games.length - 1] ? 1 : 0,
                              borderBottomColor: colors.borderColor,
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: selectedGame === game ? colors.backgroundColor : 'transparent',
                            }}
                          >
                            <Ionicons 
                              name="game-controller-outline" 
                              size={18} 
                              color={selectedGame === game ? '#EC4899' : colors.secondaryTextColor} 
                              style={{ marginRight: 12 }} 
                            />
                            <Text
                              style={{
                                color: selectedGame === game ? '#EC4899' : colors.textColor,
                                fontSize: 15,
                                fontWeight: selectedGame === game ? '600' : '400',
                                flex: 1,
                              }}
                            >
                              {game}
                            </Text>
                            <Text
                              style={{
                                color: colors.secondaryTextColor,
                                fontSize: 12,
                                marginLeft: 8,
                              }}
                            >
                              {gameFPSData[game].fps} FPS
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* FPS Graph */}
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                      {Math.min(...Object.values(gameFPSData).map(d => d.fps))} FPS
                    </Text>
                    <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold' }}>
                      {gameFPSData[selectedGame]?.fps || 0} FPS
                    </Text>
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                      {Math.max(...Object.values(gameFPSData).map(d => d.fps))} FPS
                    </Text>
                  </View>

                  {/* Bar Chart */}
                  <View
                    style={{
                      height: 200,
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    {games.map((game, index) => {
                      const gameData = gameFPSData[game];
                      const minFPS = Math.min(...Object.values(gameFPSData).map(d => d.fps));
                      const maxFPS = Math.max(...Object.values(gameFPSData).map(d => d.fps));
                      const fpsRange = maxFPS - minFPS;
                      const barHeight = fpsRange > 0 ? ((gameData.fps - minFPS) / fpsRange) * 180 : 90;
                      const isSelected = game === selectedGame;
                      
                      return (
                        <Pressable
                          key={game}
                          onPress={() => {
                            setSelectedGame(game);
                            setShowGameDropdown(false);
                          }}
                          style={{ flex: 1, alignItems: 'center' }}
                        >
                          <View
                            style={{
                              width: '100%',
                              height: Math.max(barHeight, 8),
                              backgroundColor: isSelected ? '#EC4899' : colors.iconBackground,
                              borderRadius: 8,
                              borderWidth: isSelected ? 2 : 0,
                              borderColor: '#EC4899',
                              marginBottom: 4,
                            }}
                          />
                          <Text
                            style={{
                              color: isSelected ? '#EC4899' : colors.secondaryTextColor,
                              fontSize: 9,
                              textAlign: 'center',
                              fontWeight: isSelected ? '600' : '400',
                            }}
                            numberOfLines={1}
                          >
                            {gameData.fps}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Performance Indicator */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: colors.borderColor,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="speedometer" size={18} color="#EC4899" style={{ marginRight: 8 }} />
                    <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
                      Performance Level
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: (gameFPSData[selectedGame]?.fps || 0) >= 100 ? '#10B981' + '20' : (gameFPSData[selectedGame]?.fps || 0) >= 60 ? '#F97316' + '20' : '#EF4444' + '20',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: (gameFPSData[selectedGame]?.fps || 0) >= 100 ? '#10B981' : (gameFPSData[selectedGame]?.fps || 0) >= 60 ? '#F97316' : '#EF4444',
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {(gameFPSData[selectedGame]?.fps || 0) >= 100 ? 'Excellent' : (gameFPSData[selectedGame]?.fps || 0) >= 60 ? 'Good' : 'Playable'}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Summary Card */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 20,
            marginTop: 24,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.textColor, fontSize: 18, fontWeight: 'bold' }}>
              {buildMode === 'upgrade' ? 'Upgrade Summary' : 'Build Summary'}
            </Text>
            <View
              style={{
                backgroundColor: '#10B981' + '20',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>
                {buildResults.estimatedPerformance} Performance
              </Text>
            </View>
          </View>
          
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                {buildMode === 'upgrade' ? 'Upgrade Budget' : 'Budget'}
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
                ${parseInt(budget).toLocaleString()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                {buildMode === 'upgrade' ? 'Upgrade Cost' : 'Total Cost'}
              </Text>
              <Text style={{ color: colors.textColor, fontSize: 14, fontWeight: '600' }}>
                ${buildResults.totalPrice.toFixed(2)}
              </Text>
            </View>
            {buildMode === 'new' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                  Remaining
                </Text>
                <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '600' }}>
                  ${(parseInt(budget) - buildResults.totalPrice).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ color: colors.secondaryTextColor, fontSize: 14 }}>
                {buildMode === 'upgrade' ? 'Upgrades Found Locally' : 'Parts Found Locally'}
              </Text>
              <Text style={{ color: '#EC4899', fontSize: 14, fontWeight: '600' }}>
                {buildResults.parts.filter(p => p.localSeller).length} / {buildResults.parts.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Parts List */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.textColor, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            {buildMode === 'upgrade' ? 'Recommended Upgrades' : 'Recommended Parts'}
          </Text>
          
          <View style={{ gap: 16 }}>
            {buildResults.parts.map((part, index) => (
              <Pressable
                key={part.id}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                  flexDirection: 'row',
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    overflow: 'hidden',
                    marginRight: 12,
                    backgroundColor: colors.iconBackground,
                  }}
                >
                  <Image
                    source={{ uri: part.image }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    {part.aiRecommended && (
                      <View
                        style={{
                          backgroundColor: '#EC4899' + '20',
                          borderRadius: 4,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          marginRight: 6,
                        }}
                      >
                        <Text style={{ color: '#EC4899', fontSize: 10, fontWeight: '600' }}>
                          AI
                        </Text>
                      </View>
                    )}
                    <Text style={{ color: colors.secondaryTextColor, fontSize: 11, fontWeight: '500' }}>
                      {part.category}
                    </Text>
                  </View>
                  
                  <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                    {part.name}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#EC4899', fontSize: 18, fontWeight: 'bold' }}>
                      ${part.price.toFixed(2)}
                    </Text>
                    {part.localSeller ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="location" size={14} color="#10B981" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '500' }}>
                          {part.distance} away
                        </Text>
                      </View>
                    ) : (
                      <Text style={{ color: colors.secondaryTextColor, fontSize: 12 }}>
                        Online only
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* AI Notes */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="sparkles" size={20} color="#EC4899" style={{ marginRight: 8 }} />
            <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
              AI Recommendations
            </Text>
          </View>
          <Text style={{ color: colors.secondaryTextColor, fontSize: 14, lineHeight: 20 }}>
            {buildMode === 'upgrade' 
              ? `These upgrades are optimized for ${buildTypeLabels[buildType]?.toLowerCase() || 'your'} use case at ${resolution} resolution. All recommended parts are compatible with your current build and selected to maximize performance improvements within your budget.`
              : `This build is optimized for ${buildTypeLabels[buildType]?.toLowerCase() || 'your'} use case at ${resolution} resolution. All parts are compatible and selected to maximize performance within your budget.`
            }
            {buildResults.parts.filter(p => p.localSeller).length > 0 && 
              ` ${buildResults.parts.filter(p => p.localSeller).length} ${buildMode === 'upgrade' ? 'upgrades' : 'parts'} are available from local sellers within ${radius} miles.`
            }
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons - Fixed at Bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: 16,
          paddingHorizontal: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
          backgroundColor: colors.backgroundColor,
          borderTopWidth: 1,
          borderTopColor: colors.borderColor,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            flex: 1,
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            height: 56,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.borderColor,
          }}
        >
          <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
            {buildMode === 'upgrade' ? 'Edit Upgrades' : 'Edit Build'}
          </Text>
        </Pressable>
        
        <Pressable
          onPress={() => {
            // In real app, this would save the build or add to cart
            router.push('/(tabs)');
          }}
          style={{ flex: 1 }}
        >
          {({ pressed }) => (
            <LinearGradient
              colors={['#EC4899', '#F97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                height: 56,
                width: '100%',
                opacity: pressed ? 0.8 : 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                {buildMode === 'upgrade' ? 'Save Upgrades' : 'Save Build'}
              </Text>
            </LinearGradient>
          )}
        </Pressable>
      </View>
    </View>
  );
}
