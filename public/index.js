document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('data-list');
    const updateTimeElement = document.getElementById('update-time');
    let previousData = []; // 이전 데이터를 저장
    let isFirstLoad = true; // 첫 번째 로드 여부 확인

    // 데이터를 API에서 가져와 업데이트하는 함수
    async function fetchAndUpdateData() {
        try {
            const response = await fetch('/api/tving');
            const { success, data, lastUpdated } = await response.json();

            if (success) {
                if (!isFirstLoad && JSON.stringify(data) === JSON.stringify(previousData)) {
                    return;
                }

                // 업데이트된 시간 표시
                updateTimeElement.textContent = `마지막 업데이트: ${lastUpdated}`;

                // 기존 데이터 초기화
                listContainer.innerHTML = '';

                // 데이터 비교 및 업데이트
                data.forEach(item => {
                    const previousItem = previousData.find(
                        prev => prev.channel === item.channel && prev.program === item.program
                    );

                    let changeRate = '';
                    let newIndicator = '';
                    let rateClass;

                    if (!isFirstLoad && previousItem) {
                        // 시청률 변화를 계산
                        const prevViewership = parseFloat(previousItem.viewership.replace('%', '')) || 0;
                        const currentViewership = parseFloat(item.viewership.replace('%', '')) || 0;
                        const rateChange = currentViewership - prevViewership;
                        rateClass = rateChange > 0 ? 'plus' : rateChange < 0 ? 'minus' : '';

                        if (rateChange === 0) {
                            changeRate = ` ( - )`; // 변화 없음
                        } else {
                            changeRate = ` (${rateChange > 0 ? '+' : ''}${rateChange.toFixed(1)}%)`; // 변화율 표시
                        }
                    } else if (!isFirstLoad) {
                        // 새로 생긴 데이터
                        newIndicator = ' (NEW)';
                    }

                    // 새로운 리스트 아이템 추가
                    const listItem = document.createElement('li');
                    listItem.classList.add('data');

                    listItem.innerHTML = `
                        <span>채널: ${item.channel}</span>
                        <span>프로그램: ${item.program}</span>
                        <span>시청률: ${item.viewership}</span>
                        <span class="${rateClass}">${changeRate}${newIndicator}</span>
                    `;
                    listContainer.appendChild(listItem);
                });

                // 이전 데이터를 현재 데이터로 업데이트
                previousData = data;
                isFirstLoad = false; // 첫 번째 로드 완료
            } else {
                console.error('데이터 로드 실패:', data.error);
            }
        } catch (error) {
            console.error('데이터 가져오기 중 오류:', error);
        }
    }

    // 최초 데이터 로드
    fetchAndUpdateData();

    // 일정 주기로 데이터 갱신
    setInterval(fetchAndUpdateData, 60000); // 60초마다 갱신
});