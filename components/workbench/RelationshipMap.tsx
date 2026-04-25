"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

import type {
  WorkbenchGoalDTO,
  WorkbenchGoalTaskDTO,
  WorkbenchTaskDTO,
  WorkbenchTaskLinkDTO,
  WorkbenchTaskStatus,
} from "./types";

type TaskNodeData = {
  kind: "task";
  task: WorkbenchTaskDTO;
  selected: boolean;
  onSelectTask: (taskId: string) => void;
};

type GoalNodeData = {
  kind: "goal";
  goal: WorkbenchGoalDTO;
  selected: boolean;
  attachedCount: number;
  onSelectGoal: (goalId: string) => void;
};

type WorkbenchNodeData = TaskNodeData | GoalNodeData;

const STATUS_THEME: Record<
  WorkbenchTaskStatus,
  {
    container: string;
    pill: string;
    miniMap: string;
  }
> = {
  Open: {
    container: "border-white/10 bg-white/5 text-white/90",
    pill: "border-white/15 bg-white/10 text-white/80",
    miniMap: "rgba(255,255,255,0.70)",
  },
  InProgress: {
    container: "border-sky-500/35 bg-sky-500/15 text-sky-50",
    pill: "border-sky-400/30 bg-sky-400/20 text-sky-100",
    miniMap: "rgba(56,189,248,0.90)",
  },
  Review: {
    container: "border-amber-500/35 bg-amber-500/15 text-amber-50",
    pill: "border-amber-400/30 bg-amber-400/20 text-amber-100",
    miniMap: "rgba(245,158,11,0.90)",
  },
  Completed: {
    container: "border-emerald-500/35 bg-emerald-500/18 text-emerald-50",
    pill: "border-emerald-400/30 bg-emerald-400/20 text-emerald-100",
    miniMap: "rgba(16,185,129,0.92)",
  },
  Overdue: {
    container: "border-rose-500/35 bg-rose-500/15 text-rose-50",
    pill: "border-rose-400/30 bg-rose-400/20 text-rose-100",
    miniMap: "rgba(244,63,94,0.92)",
  },
};

const EDGE_STROKE = "rgba(255,255,255,0.24)";
const SELECTED_EDGE_STROKE = "rgba(125,211,252,0.72)";
const GOAL_EDGE_STROKE = "rgba(245,158,11,0.82)";

function parseNodeId(id: string) {
  const [kind, rawId] = id.split(":");

  if ((kind === "task" || kind === "goal") && rawId) {
    return { kind, id: rawId } as const;
  }

  return null;
}

function TaskNode({ data }: NodeProps<TaskNodeData>) {
  const theme = STATUS_THEME[data.task.status];

  return (
    <div
      onClick={() => data.onSelectTask(data.task.id)}
      className={[
        "relative w-[190px] cursor-pointer rounded-xl border px-3 py-2 text-left shadow-lg backdrop-blur-sm transition",
        theme.container,
        data.selected
          ? "ring-2 ring-sky-300/70 shadow-[0_0_0_1px_rgba(125,211,252,0.35)]"
          : "hover:-translate-y-0.5 hover:shadow-xl",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border !border-white/20 !bg-white/80"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border !border-white/20 !bg-white/80"
      />

      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-h-[32px] overflow-hidden text-[13px] font-semibold leading-4 text-white">
          {data.task.title}
        </div>
        <span
          className={[
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            theme.pill,
          ].join(" ")}
        >
          {data.task.status}
        </span>
      </div>

      <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
        {data.task.client}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
        <span className="truncate">{data.task.assignee}</span>
        <span>{data.task.dueDate ?? "No due"}</span>
      </div>
    </div>
  );
}

function GoalNode({ data }: NodeProps<GoalNodeData>) {
  return (
    <div
      onClick={() => data.onSelectGoal(data.goal.id)}
      className={[
        "relative w-[230px] cursor-pointer rounded-2xl border border-yellow-700/40 px-4 py-3 text-left text-black shadow-[0_22px_50px_rgba(245,158,11,0.28)] transition",
        "bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.75),rgba(255,255,255,0)_34%),linear-gradient(135deg,#fde68a_0%,#f59e0b_48%,#92400e_100%)]",
        data.selected
          ? "ring-2 ring-yellow-100 shadow-[0_0_0_1px_rgba(253,230,138,0.55),0_24px_70px_rgba(245,158,11,0.38)]"
          : "hover:-translate-y-0.5 hover:brightness-110",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border !border-black/25 !bg-black/70"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border !border-black/25 !bg-black/70"
      />

      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-h-[36px] overflow-hidden text-[14px] font-black leading-5">
          {data.goal.title}
        </div>

        <span className="shrink-0 rounded-full border border-black/15 bg-black/10 px-2 py-0.5 text-[10px] font-black">
          GOAL
        </span>
      </div>

      <div className="line-clamp-2 text-[11px] font-semibold opacity-80">
        {data.goal.purpose}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-black">
        <span>{data.goal.status}</span>
        <span>{data.attachedCount} tasks</span>
      </div>
    </div>
  );
}

const nodeTypes = {
  taskNode: TaskNode,
  goalNode: GoalNode,
};

export function RelationshipMap({
  tasks,
  links,
  goals,
  goalTasks,
  selectedTaskId,
  selectedGoalId,
  onSelectTask,
  onSelectGoal,
  onMoveTask,
  onMoveGoal,
  onCreateLink,
  onCreateGoalTask,
  onDeleteLink,
  onDeleteGoalTask,
}: {
  tasks: WorkbenchTaskDTO[];
  links: WorkbenchTaskLinkDTO[];
  goals: WorkbenchGoalDTO[];
  goalTasks: WorkbenchGoalTaskDTO[];
  selectedTaskId: string;
  selectedGoalId: string;
  onSelectTask: (taskId: string) => void;
  onSelectGoal: (goalId: string) => void;
  onMoveTask: (taskId: string, mapX: number, mapY: number) => Promise<void>;
  onMoveGoal: (goalId: string, mapX: number, mapY: number) => Promise<void>;
  onCreateLink: (sourceTaskId: string, targetTaskId: string) => Promise<void>;
  onCreateGoalTask: (goalId: string, taskId: string) => Promise<void>;
  onDeleteLink: (linkId: string) => Promise<void>;
  onDeleteGoalTask: (goalTaskId: string) => Promise<void>;
}) {
  const goalTaskCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of goalTasks) {
      counts.set(item.goalId, (counts.get(item.goalId) ?? 0) + 1);
    }

    return counts;
  }, [goalTasks]);

  const mappedNodes = useMemo<Node<WorkbenchNodeData>[]>(() => {
    const taskNodes: Node<WorkbenchNodeData>[] = tasks.map((task) => ({
      id: `task:${task.id}`,
      type: "taskNode",
      position: { x: task.mapX, y: task.mapY },
      data: {
        kind: "task",
        task,
        selected: task.id === selectedTaskId,
        onSelectTask,
      },
    }));

    const goalNodes: Node<WorkbenchNodeData>[] = goals.map((goal) => ({
      id: `goal:${goal.id}`,
      type: "goalNode",
      position: { x: goal.mapX, y: goal.mapY },
      data: {
        kind: "goal",
        goal,
        selected: goal.id === selectedGoalId,
        attachedCount: goalTaskCounts.get(goal.id) ?? 0,
        onSelectGoal,
      },
    }));

    return [...goalNodes, ...taskNodes];
  }, [
    goals,
    goalTaskCounts,
    onSelectGoal,
    onSelectTask,
    selectedGoalId,
    selectedTaskId,
    tasks,
  ]);

  const mappedEdges = useMemo<Edge[]>(() => {
    const taskEdges: Edge[] = links.map((link) => {
      const touchesSelected =
        link.sourceTaskId === selectedTaskId || link.targetTaskId === selectedTaskId;

      return {
        id: `tasklink:${link.id}`,
        source: `task:${link.sourceTaskId}`,
        target: `task:${link.targetTaskId}`,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: touchesSelected ? SELECTED_EDGE_STROKE : EDGE_STROKE,
        },
        style: {
          stroke: touchesSelected ? SELECTED_EDGE_STROKE : EDGE_STROKE,
          strokeWidth: touchesSelected ? 1.9 : 1.4,
        },
      };
    });

    const goalEdges: Edge[] = goalTasks.map((item) => {
      const touchesSelected =
        item.goalId === selectedGoalId || item.taskId === selectedTaskId;

      return {
        id: `goaltask:${item.id}`,
        source: `goal:${item.goalId}`,
        target: `task:${item.taskId}`,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: GOAL_EDGE_STROKE,
        },
        style: {
          stroke: touchesSelected ? "rgba(253,230,138,0.95)" : GOAL_EDGE_STROKE,
          strokeWidth: touchesSelected ? 2.4 : 1.8,
          strokeDasharray: "6 4",
        },
      };
    });

    return [...taskEdges, ...goalEdges];
  }, [goalTasks, links, selectedGoalId, selectedTaskId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(mappedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mappedEdges);

  useEffect(() => {
    setNodes(mappedNodes);
  }, [mappedNodes, setNodes]);

  useEffect(() => {
    setEdges(mappedEdges);
  }, [mappedEdges, setEdges]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;

      const source = parseNodeId(connection.source);
      const target = parseNodeId(connection.target);

      if (!source || !target) return;

      if (source.kind === "task" && target.kind === "task") {
        const duplicate = links.some(
          (link) => link.sourceTaskId === source.id && link.targetTaskId === target.id
        );

        if (duplicate) return;

        void onCreateLink(source.id, target.id);
        return;
      }

      if (source.kind === "goal" && target.kind === "task") {
        const duplicate = goalTasks.some(
          (item) => item.goalId === source.id && item.taskId === target.id
        );

        if (duplicate) return;

        void onCreateGoalTask(source.id, target.id);
        return;
      }

      if (source.kind === "task" && target.kind === "goal") {
        const duplicate = goalTasks.some(
          (item) => item.goalId === target.id && item.taskId === source.id
        );

        if (duplicate) return;

        void onCreateGoalTask(target.id, source.id);
      }
    },
    [goalTasks, links, onCreateGoalTask, onCreateLink]
  );

  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node<WorkbenchNodeData>) => {
      const parsed = parseNodeId(node.id);

      if (!parsed) return;

      if (parsed.kind === "task") {
        void onMoveTask(parsed.id, node.position.x, node.position.y);
        return;
      }

      void onMoveGoal(parsed.id, node.position.x, node.position.y);
    },
    [onMoveGoal, onMoveTask]
  );

  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      event.stopPropagation();

      const [kind, rawId] = edge.id.split(":");

      if (!rawId) return;

      if (kind === "tasklink") {
        void onDeleteLink(rawId);
        return;
      }

      if (kind === "goaltask") {
        void onDeleteGoalTask(rawId);
      }
    },
    [onDeleteGoalTask, onDeleteLink]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black/30">
      <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-[11px] text-white/65 backdrop-blur">
        Gold boxes are goals. Drag a goal to a task to attach many tasks to
        one goal. Click a line to delete it.
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_, node) => {
          const parsed = parseNodeId(node.id);

          if (!parsed) return;

          if (parsed.kind === "task") onSelectTask(parsed.id);
          if (parsed.kind === "goal") onSelectGoal(parsed.id);
        }}
        onNodeDragStop={handleNodeDragStop}
        onEdgeClick={handleEdgeClick}
        fitView
        fitViewOptions={{ padding: 0.24 }}
        minZoom={0.25}
        maxZoom={2.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} size={1} color="rgba(255,255,255,0.06)" />
        <MiniMap
          style={{
            width: 128,
            height: 82,
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
          }}
          nodeColor={(node) => {
            const data = node.data as WorkbenchNodeData | undefined;

            if (data?.kind === "goal") return "rgba(245,158,11,0.95)";
            if (data?.kind === "task") return STATUS_THEME[data.task.status].miniMap;

            return "rgba(255,255,255,0.40)";
          }}
          maskColor="rgba(0,0,0,0.68)"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}
