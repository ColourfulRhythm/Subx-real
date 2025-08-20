import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Text, Input, Icon, Avatar } from 'react-native-elements';
import api from '../services/api';

const ForumScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Icon name="forum" type="material" size={48} color="#3B82F6" />
        </View>

        {/* Title */}
        <Text h3 style={styles.title}>
          🚧 Forum Coming Soon! 🚧
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          We're building an amazing community forum where you can connect with other investors, 
          share insights, and discuss real estate opportunities.
        </Text>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's Coming:</Text>
          <View style={styles.featureItem}>
            <Icon name="check-circle" type="material" size={16} color="#10B981" />
            <Text style={styles.featureText}>Community discussions</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" type="material" size={16} color="#10B981" />
            <Text style={styles.featureText}>Investment tips & strategies</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" type="material" size={16} color="#10B981" />
            <Text style={styles.featureText}>Real estate market insights</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" type="material" size={16} color="#10B981" />
            <Text style={styles.featureText}>Networking opportunities</Text>
          </View>
        </View>

        {/* CTA */}
        <Text style={styles.ctaText}>
          We'll notify you when the forum is ready!
        </Text>
      </View>
    </View>
  );
}; (
    <View style={styles.messageContainer}>
      {item.quotedMessage && (
        <View style={styles.quotedMessage}>
          <View style={styles.quotedContent}>
            <Text style={styles.quotedName}>{item.quotedMessage.sender.name}</Text>
            <Text style={styles.quotedText} numberOfLines={1}>
              {item.quotedMessage.content}
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Avatar
            rounded
            size="small"
            source={{ uri: item.sender.imageUrl }}
            containerStyle={styles.avatar}
          />
          <Text style={styles.senderName}>{item.sender.name}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        
        <Text style={styles.messageText}>{item.content}</Text>
        
        <View style={styles.messageActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleQuote(item)}
          >
            <Icon
              name="quote-right"
              type="font-awesome"
              size={14}
              color="#00FF9D"
            />
            <Text style={styles.actionText}>Quote</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon
              name="heart"
              type="font-awesome"
              size={14}
              color="#FF6B6B"
            />
            <Text style={styles.actionText}>{item.likes || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text h4 style={styles.headerTitle}>Forum</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {quotedMessage && (
        <Animated.View
          style={[
            styles.quotePreview,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.quotePreviewContent}>
            <Text style={styles.quotePreviewText} numberOfLines={1}>
              {quotedMessage.content}
            </Text>
            <TouchableOpacity
              onPress={() => setQuotedMessage(null)}
              style={styles.quotePreviewClose}
            >
              <Icon name="times" type="font-awesome" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <View style={styles.inputContainer}>
        <Input
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#666666"
          inputStyle={styles.input}
          containerStyle={styles.inputWrapper}
          rightIcon={
            <TouchableOpacity onPress={sendMessage}>
              <Icon
                name="paper-plane"
                type="font-awesome"
                color="#00FF9D"
                size={20}
              />
            </TouchableOpacity>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#EBF4FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#1F2937',
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    maxWidth: 300,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  ctaText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ForumScreen; 