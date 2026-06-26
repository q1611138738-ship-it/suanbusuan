import { getModuleMetadataById } from '@/config/modules';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { Navbar } from '@/components/layout/Navbar';
import { notFound } from 'next/navigation';

export default async function ChatPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const resolvedParams = await params;
  const divinationModule = getModuleMetadataById(resolvedParams.moduleId);
  
  if (!divinationModule) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <Navbar />
      <main className="flex-1 flex flex-col relative">
        <ChatContainer divinationModule={divinationModule} />
      </main>
    </div>
  );
}
