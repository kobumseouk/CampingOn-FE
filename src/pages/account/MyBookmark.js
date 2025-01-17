import React, { useEffect, useState, useRef, useCallback } from 'react';
import { campService } from "../../api/services/campService";
import { Box, Typography } from "@mui/material";
import CampBookmarkedCard from "../../components/camp/CampBookmarkedCard";
import ScrollToTopFab from "../../components/common/ScrollToTopFab";
import FavoriteIcon from "@mui/icons-material/Favorite";
import * as PropTypes from "prop-types";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { CustomSnackbar } from "components";

BookmarkBorderIcon.propTypes = {
    sx: PropTypes.shape({
        color: PropTypes.string,
        fontSize: PropTypes.number,
        marginBottom: PropTypes.number
    })
};

function MyBookmark() {
    const token = localStorage.getItem("accessToken");
    const [bookmarkCardData, setBookmarkCardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarKey, setSnackbarKey] = useState(0);

    const observerRef = useRef(null); // Intersection Observer 참조

    // 캠핑장 데이터 가져오기
    const fetchBookmarkedCamps = async () => {
        if (loading || !hasMore) return; // 로딩 중이거나 더 이상 가져올 데이터가 없으면 리턴

        setLoading(true);
        try {
            const response = await campService.getBookmarkedCamps(token, page, 3); // 페이지 및 크기 설정
            const newData = response.data.content;

            setBookmarkCardData((prevData) => [...prevData, ...newData]); // 기존 데이터에 새 데이터 추가
            setHasMore(newData.length > 0); // 새로운 데이터가 있으면 더 로드할 수 있음
            setPage((prevPage) => prevPage + 1); // 페이지 번호 증가
        } catch (error) {
            console.error("북마크된 캠핑장 로딩 실패", error);
        } finally {
            setLoading(false);
        }
    };

    // Intersection Observer의 콜백 함수
    const loadMore = useCallback((entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore) {
            fetchBookmarkedCamps();
        }
    }, [hasMore, loading]);

    // Intersection Observer 설정
    useEffect(() => {
        const observer = new IntersectionObserver(loadMore, { threshold: 1.0 });
        if (observerRef.current) observer.observe(observerRef.current);
        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [loadMore]);

    useEffect(() => {
        fetchBookmarkedCamps(); // 컴포넌트 로드 시 첫 번째 데이터 가져오기
    }, []);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const showSnackbarMessage = (message) => {
        setSnackbarOpen(false);
        setTimeout(() => {
            setSnackbarMessage(message);
            setSnackbarOpen(true);
            setSnackbarKey(prev => prev + 1);
        }, 100);
    };

    return (
        <Box sx={{ marginTop: '60px' }}>
            <Typography
                // variant="h2"
                sx={{
                    marginBottom: '20px',
                    fontWeight: "bold",
                    fontSize: "1.8rem",
                    fontFamily: "'Roboto', sans-serif",
                    color: "#333",
                    textAlign: "left",
                }}
            >
                내가 찜한 캠핑장   <FavoriteIcon
                sx={{
                    fontSize: 40, // 아이콘 크기
                    marginBottom: 1,
                    color: '#ff0000',
                }}
            />
            </Typography>

            {loading && <Typography>로딩 중...</Typography>}

            {bookmarkCardData.length > 0 ? (
                bookmarkCardData.map((camp) => (
                    <CampBookmarkedCard
                        key={camp.campId}
                        data={{
                            campId: camp.campId,
                            name: camp.name,
                            lineIntro: camp.lineIntro || `${camp.streetAddr.split(' ').slice(0, 2).join(' ')}에 있는 ${camp.name}`,
                            thumbImage: camp.thumbImage,
                            streetAddr: camp.streetAddr,
                            keywords: camp.keywords,
                            isMarked: camp.marked
                        }}
                        onBookmarkChange={showSnackbarMessage}
                    />
                ))
            ) : (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '70vh', // 화면 전체 높이
                        textAlign: 'center',
                        color: '#555',
                    }}
                >
                    {/* 북마크 아이콘 */}
                    <BookmarkBorderIcon
                        sx={{
                            fontSize: 80, // 아이콘 크기
                            marginBottom: 2,
                            color: '#cccccc',
                        }}
                    />

                    {/* 텍스트 */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                        }}
                    >
                        찜한 캠핑장이 없습니다.
                    </Typography>
                </Box>
            )}

            {/* 무한 스크롤을 위한 Intersection Observer 트리거 */}
            <div ref={observerRef} style={{ height: '1px' }} />

            <CustomSnackbar
                key={snackbarKey}
                open={snackbarOpen}
                message={snackbarMessage}
                severity="success"
                onClose={handleSnackbarClose}
            />

            <ScrollToTopFab />
        </Box>
    );
}

export default MyBookmark;
