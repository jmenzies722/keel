import { unknownLinux } from "@/lib/simulator/terminal";
import type { CommandResult, TerminalContext, TerminalRuntimeSpec } from "@/lib/simulator/types";

function status(ctx: TerminalContext): CommandResult {
  const orphan = ctx.state.orphanAlive !== false;
  const running = ctx.state.serviceActive === true;
  if (running) {
    return {
      stdout: `● checkout-api.service - Northstar checkout API
     Loaded: loaded (/etc/systemd/system/checkout-api.service; enabled)
     Active: active (running) since Sat 2026-08-22 10:41:02 UTC
   Main PID: 2401 (checkout-api)
      Tasks: 12
     Memory: 186.4M
     CGroup: /system.slice/checkout-api.service
             └━2401 /usr/local/bin/checkout-api`,
      stderr: "",
      exitCode: 0,
      discoveries: ["verified-healthy"],
    };
  }
  return {
    stdout: `● checkout-api.service - Northstar checkout API
     Loaded: loaded (/etc/systemd/system/checkout-api.service; enabled)
     Active: activating (auto-restart) (Result: exit-code) since Sat 2026-08-22 10:24:11 UTC
    Process: 2318 ExecStart=/usr/local/bin/checkout-api (code=exited, status=1/FAILURE)
   Main PID: 2318 (code=exited, status=1/FAILURE)
        CPU: 84ms

Aug 22 10:24:11 api-01 systemd[1]: checkout-api.service: Failed with result 'exit-code'.
Aug 22 10:24:11 api-01 systemd[1]: checkout-api.service: Scheduled restart job, restart counter is at 47.
Aug 22 10:24:11 api-01 systemd[1]: Stopped checkout-api.service - Northstar checkout API.
Aug 22 10:24:11 api-01 systemd[1]: Starting checkout-api.service - Northstar checkout API...
Hint: orphan still holding the port: ${orphan ? "yes" : "no"}`,
    stderr: "",
    exitCode: 3,
    discoveries: ["service-failed"],
  };
}

function journal(): CommandResult {
  return {
    stdout: `-- Journal begins at Sat 2026-08-22 09:01:11 UTC --
Aug 22 10:06:02 api-01 systemd[1]: Started checkout-api.service.
Aug 22 10:06:03 api-01 checkout-api[1842]: listening on 0.0.0.0:8080
Aug 22 10:21:44 api-01 deploy[992]: shipped checkout-api 1.14.2 (config: CHECKOUT_WORKERS=16)
Aug 22 10:22:01 api-01 systemd[1]: Stopping checkout-api.service...
Aug 22 10:22:01 api-01 checkout-api[1842]: got SIGTERM, draining
Aug 22 10:22:08 api-01 systemd[1]: checkout-api.service: State 'stop-sigterm' timed out. Killing.
Aug 22 10:22:08 api-01 systemd[1]: checkout-api.service: Main process exited, code=killed, status=9/KILL
Aug 22 10:22:09 api-01 systemd[1]: Started checkout-api.service.
Aug 22 10:22:09 api-01 checkout-api[2204]: fatal: bind 0.0.0.0:8080: address already in use
Aug 22 10:22:09 api-01 systemd[1]: checkout-api.service: Main process exited, code=exited, status=1/FAILURE
Aug 22 10:22:14 api-01 checkout-api[2211]: fatal: bind 0.0.0.0:8080: address already in use
Aug 22 10:23:01 api-01 checkout-api[2288]: fatal: bind 0.0.0.0:8080: address already in use
Aug 22 10:24:11 api-01 checkout-api[2318]: fatal: bind 0.0.0.0:8080: address already in use`,
    stderr: "",
    exitCode: 0,
    discoveries: ["address-in-use", "rushed-deploy"],
  };
}

function ps(ctx: TerminalContext): CommandResult {
  const orphan = ctx.state.orphanAlive !== false;
  const running = ctx.state.serviceActive === true;
  const orphanLine = orphan
    ? "app       1842  0.4  4.6 512440 188212 ?       S    10:06   0:11 /usr/local/bin/checkout-api\n"
    : "";
  const main = running
    ? "app       2401  1.1  4.5 498112 186401 ?       Ss   10:41   0:02 /usr/local/bin/checkout-api\n"
    : "";
  return {
    stdout: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.2 167832  9840 ?        Ss   09:01   0:02 /sbin/init
root       142  0.0  0.4  89220 18440 ?        Ss   09:01   0:01 systemd-journald
postgres   611  0.2  3.1 702440 126088 ?       Ss   09:01   0:18 /usr/lib/postgresql/16/bin/postgres
${orphanLine}${main}app        902  0.0  0.8 220112  33120 ?        Ss   09:12   0:01 /usr/bin/node /opt/healthcheck/agent.js
app       3011  0.0  0.3  22012 12208 pts/0    Ss   10:28   0:00 -bash`,
    stderr: "",
    exitCode: 0,
    discoveries: orphan ? ["orphan-process"] : ["process-table"],
  };
}

export const checkoutRuntime: TerminalRuntimeSpec = {
  id: "checkout-api",
  hostname: "api-01",
  promptUser: "oncall",
  cwd: "/home/oncall",
  motd: "Northstar prod · api-01 · authorized on-call session. Type `help`.",
  commands: [
    { match: "systemctl status checkout-api", run: status },
    { match: "systemctl status checkout-api.service", run: status },
    { match: "journalctl -u checkout-api", run: journal },
    { match: "journalctl -u checkout-api -n 50", run: journal },
    { match: "journalctl -u checkout-api --no-pager", run: journal },
    {
      match: "journalctl",
      prefix: true,
      run: (ctx) =>
        ctx.raw.includes("checkout")
          ? journal()
          : {
              stdout: "Specify a unit. Try: journalctl -u checkout-api",
              stderr: "",
              exitCode: 0,
              discoveries: [],
            },
    },
    { match: "ps aux", run: ps },
    { match: "ps -ef", run: ps },
    { match: "ps aux | grep checkout", run: ps },
    {
      match: "ss -lntp",
      run: (ctx) => ({
        stdout:
          ctx.state.orphanAlive !== false
            ? `State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
LISTEN 0      128          0.0.0.0:22         0.0.0.0:*     users:(("sshd",pid=318,fd=3))
LISTEN 0      4096         0.0.0.0:5432       0.0.0.0:*     users:(("postgres",pid=611,fd=6))
LISTEN 0      4096         0.0.0.0:8080       0.0.0.0:*     users:(("checkout-api",pid=1842,fd=12))`
            : `State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
LISTEN 0      128          0.0.0.0:22         0.0.0.0:*     users:(("sshd",pid=318,fd=3))
LISTEN 0      4096         0.0.0.0:5432       0.0.0.0:*     users:(("postgres",pid=611,fd=6))
${ctx.state.serviceActive === true ? `LISTEN 0      4096         0.0.0.0:8080       0.0.0.0:*     users:(("checkout-api",pid=2401,fd=12))` : ""}`,
        stderr: "",
        exitCode: 0,
        discoveries: ctx.state.orphanAlive !== false ? ["port-holder"] : ["port-clear"],
      }),
    },
    { match: "ss -tlnp", run: (ctx) => checkoutRuntime.commands.find((c) => c.match === "ss -lntp")!.run(ctx) },
    {
      match: "lsof -i :8080",
      run: (ctx) => ({
        stdout:
          ctx.state.orphanAlive !== false
            ? `COMMAND       PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
checkout-a   1842  app   12u  IPv4  81220      0t0  TCP *:8080 (LISTEN)`
            : ctx.state.serviceActive === true
              ? `COMMAND       PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
checkout-a   2401  app   12u  IPv4  93401      0t0  TCP *:8080 (LISTEN)`
              : "",
        stderr: "",
        exitCode: ctx.state.orphanAlive !== false || ctx.state.serviceActive === true ? 0 : 1,
        discoveries: ctx.state.orphanAlive !== false ? ["port-holder"] : [],
      }),
    },
    {
      match: "free -h",
      run: () => ({
        stdout: `               total        used        free      shared  buff/cache   available
Mem:           7.6Gi       3.1Gi       2.4Gi       41Mi       2.1Gi       4.2Gi
Swap:          2.0Gi       0.0Gi       2.0Gi`,
        stderr: "",
        exitCode: 0,
        discoveries: ["memory-ok"],
      }),
    },
    {
      match: "df -h",
      run: () => ({
        stdout: `Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2   40G   29G  9.1G  77% /
tmpfs           3.9G     0  3.9G   0% /dev/shm`,
        stderr: "",
        exitCode: 0,
        discoveries: ["disk-ok"],
      }),
    },
    {
      match: "cat /etc/systemd/system/checkout-api.service",
      run: () => ({
        stdout: `[Unit]
Description=Northstar checkout API
After=network.target postgresql.service

[Service]
User=app
ExecStart=/usr/local/bin/checkout-api
Restart=always
RestartSec=5
KillMode=control-group
TimeoutStopSec=7
EnvironmentFile=/etc/checkout-api.env

[Install]
WantedBy=multi-user.target`,
        stderr: "",
        exitCode: 0,
        discoveries: ["unit-file"],
      }),
    },
    {
      match: "cat /etc/checkout-api.env",
      run: () => ({
        stdout: `PORT=8080
DATABASE_URL=postgres://checkout:****@127.0.0.1:5432/checkout
CHECKOUT_WORKERS=16
LOG_LEVEL=info`,
        stderr: "",
        exitCode: 0,
        discoveries: ["config-ok"],
      }),
    },
    {
      match: "kill 1842",
      run: (ctx) =>
        ctx.state.orphanAlive === false
          ? { stdout: "", stderr: "kill: (1842): No such process", exitCode: 1, discoveries: [] }
          : {
              stdout: "",
              stderr: "",
              exitCode: 0,
              discoveries: ["orphan-killed"],
              effects: { orphanAlive: false },
            },
    },
    {
      match: "kill -9 1842",
      run: (ctx) =>
        ctx.state.orphanAlive === false
          ? { stdout: "", stderr: "kill: (1842): No such process", exitCode: 1, discoveries: [] }
          : {
              stdout: "",
              stderr: "",
              exitCode: 0,
              discoveries: ["orphan-killed"],
              effects: { orphanAlive: false },
            },
    },
    {
      match: "systemctl start checkout-api",
      run: (ctx) => {
        if (ctx.state.orphanAlive !== false) {
          return {
            stdout: "",
            stderr:
              "Job for checkout-api.service failed because the control process exited with error code.\nSee \"systemctl status checkout-api.service\" and \"journalctl -xeu checkout-api.service\" for details.",
            exitCode: 1,
            discoveries: ["start-failed"],
          };
        }
        return {
          stdout: "",
          stderr: "",
          exitCode: 0,
          discoveries: ["service-started"],
          effects: { serviceActive: true },
        };
      },
    },
    {
      match: "systemctl restart checkout-api",
      run: (ctx) => {
        if (ctx.state.orphanAlive !== false) {
          return {
            stdout: "",
            stderr:
              "Job for checkout-api.service failed because the control process exited with error code.\nSee \"systemctl status checkout-api.service\" and \"journalctl -xeu checkout-api.service\" for details.",
            exitCode: 1,
            discoveries: ["symptom-restart"],
            effects: {},
          };
        }
        return {
          stdout: "",
          stderr: "",
          exitCode: 0,
          discoveries: ["service-started"],
          effects: { serviceActive: true },
        };
      },
    },
    {
      match: "curl localhost:8080/health",
      run: (ctx) =>
        ctx.state.serviceActive === true
          ? {
              stdout: `{"status":"ok","service":"checkout-api","version":"1.14.2"}`,
              stderr: "",
              exitCode: 0,
              discoveries: ["verified-healthy"],
            }
          : ctx.state.orphanAlive !== false
            ? {
                stdout: `{"status":"degraded","service":"checkout-api","version":"1.14.1","note":"draining; parent supervisor gone"}`,
                stderr: "",
                exitCode: 0,
                discoveries: ["orphan-responds"],
              }
            : {
                stdout: "",
                stderr: "curl: (7) Failed to connect to localhost port 8080: Connection refused",
                exitCode: 7,
                discoveries: [],
              },
    },
    {
      match: "curl -s localhost:8080/health",
      run: (ctx) => checkoutRuntime.commands.find((c) => c.match === "curl localhost:8080/health")!.run(ctx),
    },
  ],
  fallback: unknownLinux,
};
