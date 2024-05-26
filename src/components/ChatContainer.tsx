import React, { useEffect, useState } from 'react';
import { AiOutlineSend } from 'react-icons/ai';
import { ChatData } from '../interfaces/chat';
import socket from '../socket';
import ChatBubble from './ChatBubble';
import Dialogist from './Dialogist';
import { Point, generateKeyPair, encryptString, decryptString } from '../utils/ECC';

interface ChatContainerProps {
  myName?: string;
  myNIM?: string;
  dialogist?: string;
  handleReveal: () => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  myName,
  myNIM,
  dialogist,
  handleReveal,
}) => {
  const [message, setMessage] = useState('');
  const [chatData, setChatData] = useState<ChatData[]>([]);
  const [privateKey, setPrivateKey] = useState<number>(0);
  const [publicKey, setPublicKey] = useState<Point>({ x: 0, y: 0 });

  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    // Generate key pair when component mounts
    const [privateKey, publicKey] = generateKeyPair();
    setPrivateKey(privateKey);
    setPublicKey(publicKey);
  }, []);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    socket.on('message', async ({ content, from }) => {
      const decryptedMessage = await decryptString(privateKey, content);
      setChatData((prevData) => [
        { message: decryptedMessage, isFromMe: socket.id === from },
        ...prevData,
      ]);
    });
  }, [privateKey]);

  const sendMessage = async () => {
    if (message !== '') {
      const encryptedMessage = await encryptString(publicKey, message);
      socket.emit('message', { content: encryptedMessage });
      setMessage('');
    }
  };

  const onEnterPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key == 'Enter' && event.shiftKey == false && width > 768) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white h-[100%] w-[777px] lg:w-[450px] xl:w-[500px] xxl:w-[600px] 3xl:w-[680px] rounded-[15px]">
      <div className="h-[15%] lg:hidden">
        <Dialogist dialogist={dialogist} handleReveal={handleReveal} />
      </div>
      <div className="xs:h-[55vh] lg:h-[68vh] w-[100%] lg:rounded-t-[15px] flex flex-col-reverse max-w-[100%] px-2 pt-2 overflow-y-scroll overflow-x-hidden">
        {chatData.map((chat, idx) => (
          <ChatBubble key={idx} sent={chat.isFromMe}>
            {chat.message}
          </ChatBubble>
        ))}
      </div>
      <div className="xs:h-[10vh] lg:h-[20%] bg-white border-solid border-t-2 border-primaryOrange flex justify-between items-center xs:px-4 lg:px-8 rounded-b-[15px] py-4">
        <textarea
          placeholder="Enter a message"
          className="resize-none outline-none w-[100%] h-[80%] xs:mr-4 lg:mr-10"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onEnterPress}
        />

        <div
          onClick={sendMessage}
          className="bg-primaryOrange h-[51px] w-[51px] min-w-[51px] rounded-full flex justify-center items-center text-[30px] text-white cursor-pointer"
        >
          <AiOutlineSend />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
