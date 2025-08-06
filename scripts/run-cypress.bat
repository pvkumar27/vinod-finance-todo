@echo off
REM Enhanced Cypress test runner script for FinTask (Windows)

setlocal enabledelayedexpansion

REM Default values
set ENVIRONMENT=local
set BROWSER=chrome
set HEADED=false
set SPEC=
set CLEANUP_ONLY=false

REM Parse command line arguments
:parse_args
if "%~1"=="" goto end_parse
if "%~1"=="--env" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--browser" (
    set BROWSER=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--headed" (
    set HEADED=true
    shift
    goto parse_args
)
if "%~1"=="--spec" (
    set SPEC=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--cleanup-only" (
    set CLEANUP_ONLY=true
    shift
    goto parse_args
)
shift
goto parse_args

:end_parse

REM Set base URL based on environment
if "%ENVIRONMENT%"=="local" (
    set BASE_URL=http://localhost:3000
) else if "%ENVIRONMENT%"=="staging" (
    set BASE_URL=https://staging-fintask.netlify.app
) else if "%ENVIRONMENT%"=="prod" (
    set BASE_URL=https://fintask.netlify.app
) else (
    set BASE_URL=http://localhost:3000
)

echo Running Cypress tests
echo Environment: %ENVIRONMENT%
echo Base URL: %BASE_URL%
echo Browser: %BROWSER%

REM Set environment variables
set CYPRESS_BASE_URL=%BASE_URL%

REM Build Cypress command
set CYPRESS_CMD=npx cypress run --browser %BROWSER%

if "%HEADED%"=="true" (
    set CYPRESS_CMD=%CYPRESS_CMD% --headed
)

if not "%SPEC%"=="" (
    set CYPRESS_CMD=%CYPRESS_CMD% --spec %SPEC%
)

if "%CLEANUP_ONLY%"=="true" (
    set CYPRESS_CMD=%CYPRESS_CMD% --spec "cypress/e2e/utils/cleanup.cy.js"
)

REM Run tests
echo Running: %CYPRESS_CMD%
%CYPRESS_CMD%

echo Tests completed