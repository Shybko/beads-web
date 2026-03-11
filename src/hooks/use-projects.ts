"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { loadProjectBeads, groupBeadsByStatus } from "@/lib/beads-parser";
import {
  getProjectsWithTags,
  createProject,
  type CreateProjectInput,
} from "@/lib/db";
import type { Project, Tag, BeadCounts } from "@/types";

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  loadingStatus: string | null;
  error: Error | null;
  refetch: () => Promise<void>;
  addProject: (input: CreateProjectInput) => Promise<Project>;
  updateProjectTags: (projectId: string, tags: Tag[]) => void;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef(0);

  const fetchProjects = useCallback(async () => {
    const loadId = ++loadingRef.current;
    try {
      setIsLoading(true);
      setError(null);
      setLoadingStatus("Loading projects...");

      const data = await getProjectsWithTags();
      if (loadId !== loadingRef.current) return;

      // Show projects immediately with empty counts
      const zeroCounts: BeadCounts = { open: 0, in_progress: 0, inreview: 0, closed: 0 };
      setProjects(data.map((p) => ({ ...p, beadCounts: zeroCounts })));
      setIsLoading(false);

      // Then load beads per-project, updating each as it completes
      let loaded = 0;
      const total = data.length;

      const loadBeads = async (project: Project) => {
        try {
          const result = await loadProjectBeads(project.path, { withSource: true });
          const grouped = groupBeadsByStatus(result.beads);
          const beadCounts: BeadCounts = {
            open: grouped.open.length,
            in_progress: grouped.in_progress.length,
            inreview: grouped.inreview.length,
            closed: grouped.closed.length,
          };
          return { id: project.id, beadCounts, dataSource: result.source };
        } catch {
          return { id: project.id, beadCounts: zeroCounts, dataSource: undefined };
        }
      };

      // Fire all requests in parallel, update state as each resolves
      const promises = data.map(async (project) => {
        const result = await loadBeads(project);
        if (loadId !== loadingRef.current) return;

        loaded++;
        setLoadingStatus(
          loaded < total
            ? `Loading beads: ${project.name} (${loaded}/${total})`
            : null
        );

        setProjects((prev) =>
          prev.map((p) =>
            p.id === result.id
              ? { ...p, beadCounts: result.beadCounts, dataSource: result.dataSource }
              : p
          )
        );
      });

      await Promise.all(promises);
      if (loadId === loadingRef.current) {
        setLoadingStatus(null);
      }
    } catch (err) {
      if (loadId !== loadingRef.current) return;
      setError(err instanceof Error ? err : new Error("Failed to fetch projects"));
      setIsLoading(false);
      setLoadingStatus(null);
    }
  }, []);

  const addProject = useCallback(
    async (input: CreateProjectInput): Promise<Project> => {
      const newProject = await createProject(input);
      await fetchProjects();
      return newProject;
    },
    [fetchProjects]
  );

  const updateProjectTags = useCallback((projectId: string, tags: Tag[]) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, tags } : project
      )
    );
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    loadingStatus,
    error,
    refetch: fetchProjects,
    addProject,
    updateProjectTags,
  };
}
