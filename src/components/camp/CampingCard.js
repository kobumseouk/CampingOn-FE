import React, { useState, useEffect } from "react";
import { bookmarkService } from "../../api/services/bookmarkService";
import { Box, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { getRandomThumbnail } from "../../utils/ThumbnailUtils";
import {useAuth} from 'context/AuthContext';

const CampingCard = ({ thumbImage, name, address, keywords, lineIntro, marked, onClick, campId
                         , onShowSnackbarNone, onShowSnackbarBookmark, className }) => {
    const isAuthenticated = useAuth();
    const [liked, setLiked] = useState(marked);
    const [imageUrl, setImageUrl] = useState(""); // 이미지 URL 상태 추가

    // 이미지가 없을 경우 랜덤으로 썸네일 선택
    useEffect(() => {
        const randomImage = getRandomThumbnail(thumbImage, campId);
        setImageUrl(randomImage);
    }, [thumbImage]);

    const toggleLike = async (event) => {
        event.stopPropagation(); // 부모의 onClick 이벤트가 실행되지 않도록 중단

        if (!isAuthenticated) {
            onShowSnackbarNone(); // 회원만 이용할 수 있는 기능 메시지 띄우기
        } else {
            try {
                await bookmarkService.toggleBookmark(campId);
                setLiked(!liked);
                onShowSnackbarBookmark(); // 찜 상태 변경 메시지 띄우기
            } catch (error) {
                console.error("찜 클릭 에러 : ", error);
            }
        }
    };

    return (
        <div
            onClick={onClick} // 부모 컴포넌트에서 전달받은 onClick 이벤트 연결
            className={className}
        >
            <div className="relative h-36"> {/* 이미지 영역 */}
                <img
                    src={imageUrl}
                    alt={`${name} 사진`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 text-red-500 text-2xl focus:outline-none">
                    <Box sx={{ marginTop: "auto", textAlign: "right" }}>
                        <IconButton color="error" onClick={toggleLike}>
                            {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                    </Box>
                </div>
            </div>
            <div className="p-3"> {/* 텍스트 영역 */}
                <h3 className="text-lg font-bold mb-1 truncate">{name}</h3> {/* 제목 */}
                <p className="text-sm text-gray-500 mb-1 truncate">{address}</p> {/* 주소 */}
                <div
                    className="flex flex-wrap gap-1 mb-1"
                    style={{
                        maxHeight: "calc(2 * 1.5rem)", // 한 줄의 높이(1.5rem) * 2줄
                        overflow: "hidden",           // 2줄 초과 내용은 숨김 처리
                    }}
                >
                    {keywords.map((keyword, index) => (
                        <span
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                        >
                            #{keyword}
                        </span>
                    ))}
                </div>
                <p className="text-sm text-gray-600 truncate mt-2">{lineIntro}</p> {/* 소개 */}
            </div>
        </div>
    );
};

export default CampingCard;
