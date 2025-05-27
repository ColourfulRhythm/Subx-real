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
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [quotedMessage, setQuotedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/forum/messages');
      setMessages(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        quotedMessageId: quotedMessage?.id,
      };

      const response = await api.post('/forum/messages', messageData);
      setMessages([...messages, response.data]);
      setNewMessage('');
      setQuotedMessage(null);
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleQuote = (message) => {
    setQuotedMessage(message);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderMessage = ({ item }) => (
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
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 20,
  },
  quotedMessage: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#00FF9D',
  },
  quotedContent: {
    flex: 1,
  },
  quotedName: {
    color: '#00FF9D',
    fontSize: 12,
    marginBottom: 2,
  },
  quotedText: {
    color: '#888888',
    fontSize: 12,
  },
  messageContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    marginRight: 8,
  },
  senderName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  timestamp: {
    color: '#666666',
    fontSize: 12,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  messageActions: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    color: '#888888',
    fontSize: 12,
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    padding: 10,
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  quotePreview: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    padding: 10,
  },
  quotePreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quotePreviewText: {
    color: '#888888',
    fontSize: 14,
    flex: 1,
  },
  quotePreviewClose: {
    padding: 5,
  },
});

export default ForumScreen; 