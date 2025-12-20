import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated, getUser, setUser } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api-client";
import { Video, VoteResponse, UserData } from "@shared/api";
import Layout from "@/components/Layout";

// ... (outras interfaces e componentes)

export default function Feed() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUserState] = useState<UserData | null>(getUser());
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  // ... (outros estados)

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [videosData, userData] = await Promise.all([
        apiGet<Video[]>("/api/videos"),
        apiGet<UserData>("/api/user/profile"), // Nova rota para buscar perfil completo
      ]);

      setVideos(videosData);
      setUserState(userData);
      setUser(userData); // Atualiza o localStorage

      if (videosData.length > 0) {
        setSelectedVideo(videosData[0]);
      }
    } catch (err) {
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
      return;
    }
    loadInitialData();
  }, [navigate, location.key]); // Recarrega quando a rota muda

  const handleVote = useCallback(async (videoId: string, voteType: "like" | "dislike", event: React.MouseEvent) => {
    // ... (lógica de verificação de tempo de vídeo)

    try {
      setVoting(true);
      const response = await apiPost<VoteResponse>(`/api/videos/${videoId}/vote`, { voteType });

      // Atualiza o estado do usuário com a resposta do servidor
      setUserState(prevUser => ({
        ...prevUser!,
        balance: response.newBalance,
        dailyVotesLeft: response.dailyVotesRemaining,
        totalVideosWatched: response.totalVideosWatched,
        votingStreak: response.votingStreak,
      }));
      setUser({
        ...user!,
        balance: response.newBalance,
        dailyVotesLeft: response.dailyVotesRemaining,
        totalVideosWatched: response.totalVideosWatched,
        votingStreak: response.votingStreak,
      });

      // ... (animação de dinheiro e lógica para próximo vídeo)

    } catch (err) {
      // ... (tratamento de erro)
    } finally {
      setVoting(false);
    }
  }, [user, videos, selectedVideo, watchedSeconds]);

  return (
    <Layout>
      {/* ... (UI que usa os novos estados, ex: user?.dailyVotesLeft) */}
    </Layout>
  );
}
