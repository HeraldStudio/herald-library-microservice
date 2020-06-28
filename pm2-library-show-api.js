module.exports = { 
    apps:[    {
        name: "library-show-api-1",
        script: "/srv/herald-library-microservice/app.js",
        cwd: "/srv/herald-library-microservice",
        autorestart: true,
        args:"--port=3010",
        interpreter_args:"--tls-min-v1.0",
        watch: true,
        env: {
          NODE_ENV: "production",
          UV_THREADPOOL_SIZE: 128
        },
        env_production: {
          NODE_ENV: "production",
          UV_THREADPOOL_SIZE: 128
        },
        exec_mode: "fork"
        },
        {
        name: "library-show-api-2",
        script: "/srv/herald-library-microservice/app.js",
        cwd: "/srv/herald-library-microservice",
        autorestart: true,
        args:"--port=3011",
        interpreter_args:"--tls-min-v1.0",
        watch: true,
        env: {
          NODE_ENV: "production",
          UV_THREADPOOL_SIZE: 128
        },
        env_production: {
          NODE_ENV: "production",
          UV_THREADPOOL_SIZE: 128
        },
        exec_mode: "fork"
        },
        {
        name: "library-show-api-3",
        script: "/srv/herald-library-microservice/app.js",
        cwd: "/srv/herald-library-microservice",
        autorestart: true,
        args:"--port=3012",
        interpreter_args:"--tls-min-v1.0",
        watch: true,
        env: {
          NODE_ENV: "production",
          UV_THREADPOOL_SIZE: 128
        },
        env_production: {
          NODE_ENV: "production",
          UV_THREADPOOL_SIZE: 128
        },
        exec_mode: "fork"
        },
        {
        name: "library-show-api-4",
        script: "/srv/herald-library-microservice/app.js",
        cwd: "/srv/herald-library-microservice",
        autorestart: true,
        args:"--port=3013",
        interpreter_args:"--tls-min-v1.0",
        watch: true,
        env: {
          NODE_ENV: "production",
          UV_THREADPOOL_SIZE: 128
        },
        env_production: {
          NODE_ENV: "production",
          UV_THREADPOOL_SIZE: 128
        },
        exec_mode: "fork"
        },]
}