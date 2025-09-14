import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import { MicIcon, SendHorizonalIcon } from 'lucide-react';
import { useState } from 'react';
import {
  Conversation,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';

const ChatModal = () => {
  const [text, setText] = useState<string>('');
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) return;

    console.log("Message submitted:", message);
    setText('');
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      <Conversation>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
        <PromptInputBody className="relative">
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>

          {/* Textarea */}
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            className="pr-10" // add right padding so icons don’t overlap text
          />

          {/* Mic OR Send Button inside textarea */}
          <div className="absolute right-2 bottom-2">
            {text.trim().length === 0 ? (
              <PromptInputButton
                onClick={() => setUseMicrophone(!useMicrophone)}
                variant={useMicrophone ? 'default' : 'ghost'}
                size="icon"
              >
                <MicIcon size={18} />
              </PromptInputButton>
            ) : (
              <PromptInputSubmit
                disabled={false}
                status="ready"
                className="p-2 bg-primary text-white"
              >
                <SendHorizonalIcon size={18} />
              </PromptInputSubmit>
            )}
          </div>
        </PromptInputBody>
      </PromptInput>
    </div>
  );
};

export default ChatModal;
