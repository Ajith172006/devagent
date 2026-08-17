@REM Maven Wrapper script for Windows
@echo off
setlocal
set WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar
if "%JAVA_HOME%" == "" (
  set JAVA_EXE=java
) else (
  set JAVA_EXE="%JAVA_HOME%\bin\java"
)
%JAVA_EXE% "-Dmaven.multiModuleProjectDirectory=%~dp0." -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
endlocal

