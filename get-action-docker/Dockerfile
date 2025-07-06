FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env

COPY ./src /App
RUN cd /App && dotnet restore
RUN cd /App && dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY --from=build-env /App/out .
ENTRYPOINT ["dotnet", "/DotnetDockerAction.dll"]
