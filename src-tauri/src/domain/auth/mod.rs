/***********************************************************
 auth 디렉토리는 사용자 인증 및 권한 검증을 담당한다

 1. dto
    - 인증 관련 요청 / 응답 데이터 구조 정의

 2. handler
    - 인증 관련 HTTP 라우트 처리

 3. service
    - 인증 로직 수행
 ***********************************************************/

pub mod dto;
pub mod handler;
pub mod service;
pub mod entity;
pub mod repository;