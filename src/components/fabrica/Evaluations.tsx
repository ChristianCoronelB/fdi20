'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Vote, Star, Save, Send, Eye, Plus, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Project, Evaluation } from './types';
import { EVALUATION_CRITERIA } from './types';
import { getStatusColor } from './helpers';

interface EvaluationsProps {
  projects: Project[];
  userId: string;
  userRole: string;
}

export function Evaluations({ projects, userId, userRole }: EvaluationsProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const [evaluationForm, setEvaluationForm] = useState({
    innovation: 0,
    innovationComment: '',
    viability: 0,
    viabilityComment: '',
    impact: 0,
    impactComment: '',
    presentation: 0,
    presentationComment: '',
    scalability: 0,
    scalabilityComment: '',
    execution: 0,
    executionComment: '',
    generalComment: '',
  });

  const canEvaluate = userRole === 'EVALUATOR' || userRole === 'ADMIN' || userRole === 'ORGANIZER';

  // Fetch evaluations when needed
  const fetchEvaluations = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/evaluations?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEvaluations(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading evaluations:', error);
    }
    setLoading(false);
  }, [userId, loading]);

  // Initial fetch on mount
  useEffect(() => {
    void fetchEvaluations();
  }, [userId]);

  const handleStartEvaluation = (project: Project) => {
    setSelectedProject(project);
    // Check if there's an existing evaluation
    const existing = evaluations.find(e => e.projectId === project.id);
    if (existing) {
      setEvaluationForm({
        innovation: existing.innovation,
        innovationComment: existing.innovationComment || '',
        viability: existing.viability,
        viabilityComment: existing.viabilityComment || '',
        impact: existing.impact,
        impactComment: existing.impactComment || '',
        presentation: existing.presentation,
        presentationComment: existing.presentationComment || '',
        scalability: existing.scalability,
        scalabilityComment: existing.scalabilityComment || '',
        execution: existing.execution,
        executionComment: existing.executionComment || '',
        generalComment: existing.generalComment || '',
      });
    } else {
      setEvaluationForm({
        innovation: 0, innovationComment: '',
        viability: 0, viabilityComment: '',
        impact: 0, impactComment: '',
        presentation: 0, presentationComment: '',
        scalability: 0, scalabilityComment: '',
        execution: 0, executionComment: '',
        generalComment: '',
      });
    }
    setEvaluationDialogOpen(true);
  };

  const handleSaveEvaluation = async (submit: boolean = false) => {
    if (!selectedProject) return;

    // Validate at least one criterion is evaluated
    const totalScore = (
      evaluationForm.innovation +
      evaluationForm.viability +
      evaluationForm.impact +
      evaluationForm.presentation +
      evaluationForm.scalability +
      evaluationForm.execution
    ) / 6;

    if (submit && totalScore === 0) {
      toast.error('Por favor evalúa al menos un criterio antes de enviar');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          ...evaluationForm,
          status: submit ? 'SUBMITTED' : 'DRAFT',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(submit ? 'Evaluación enviada correctamente' : 'Borrador guardado');
        await fetchEvaluations();
        setEvaluationDialogOpen(false);
        setSelectedProject(null);
      } else {
        toast.error(data.error || 'Error al guardar evaluación');
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast.error('Error al guardar evaluación');
    }
    setSaving(false);
  };

  const getProjectEvaluation = (projectId: string) => {
    return evaluations.find(e => e.projectId === projectId);
  };

  const filteredProjects = projects.filter(p => {
    if (activeFilter === 'pending') {
      return !getProjectEvaluation(p.id) || getProjectEvaluation(p.id)?.status === 'DRAFT';
    }
    if (activeFilter === 'completed') {
      return getProjectEvaluation(p.id)?.status === 'SUBMITTED';
    }
    return true;
  });

  const pendingCount = projects.filter(p => 
    !getProjectEvaluation(p.id) || getProjectEvaluation(p.id)?.status === 'DRAFT'
  ).length;

  const completedCount = evaluations.filter(e => e.status === 'SUBMITTED').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Vote className="w-6 h-6 text-amber-500" />
            Evaluaciones
          </h2>
          <p className="text-gray-500">
            {canEvaluate 
              ? 'Evalúa los proyectos según los criterios establecidos'
              : 'Solo evaluadores pueden acceder a esta sección'
            }
          </p>
        </div>
        {canEvaluate && (
          <div className="flex items-center gap-4">
            <Select value={activeFilter} onValueChange={(v: any) => setActiveFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({projects.length})</SelectItem>
                <SelectItem value="pending">Pendientes ({pendingCount})</SelectItem>
                <SelectItem value="completed">Completados ({completedCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Progress Card */}
      {canEvaluate && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Progreso de Evaluaciones</span>
              <span className="text-sm text-gray-600">
                {completedCount} de {projects.length} completadas
              </span>
            </div>
            <Progress value={(completedCount / Math.max(projects.length, 1)) * 100} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Criteria Info */}
      {canEvaluate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Criterios de Evaluación</CardTitle>
            <CardDescription>Cada criterio se evalúa del 1 al 10</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {EVALUATION_CRITERIA.map((criteria) => (
                <div key={criteria.key} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Star className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{criteria.label}</p>
                    <p className="text-xs text-gray-500">{criteria.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project, index) => {
          const evaluation = getProjectEvaluation(project.id);
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`h-full ${evaluation?.status === 'SUBMITTED' ? 'border-green-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>{project.team}</CardDescription>
                    </div>
                    {evaluation?.status === 'SUBMITTED' && (
                      <Badge className="bg-green-500 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Evaluado
                      </Badge>
                    )}
                    {evaluation?.status === 'DRAFT' && (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">
                        Borrador
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  {project.category && (
                    <Badge variant="outline" className="mb-3">{project.category}</Badge>
                  )}
                  
                  {evaluation && (
                    <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Puntaje Total</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="font-bold">{evaluation.totalScore.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">/10</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {canEvaluate && (
                    <Button
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600"
                      onClick={() => handleStartEvaluation(project)}
                    >
                      {evaluation ? (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver/Editar Evaluación
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Evaluar Proyecto
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Evaluation Dialog */}
      <Dialog open={evaluationDialogOpen} onOpenChange={setEvaluationDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Evaluación: {selectedProject?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedProject?.team} - {selectedProject?.category}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {EVALUATION_CRITERIA.map((criteria) => (
              <div key={criteria.key} className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  {criteria.label}
                  <span className="text-xs text-gray-500">({criteria.description})</span>
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        onClick={() => setEvaluationForm(prev => ({
                          ...prev,
                          [criteria.key]: score
                        }))}
                        className={`w-8 h-8 rounded font-bold text-sm transition-all ${
                          evaluationForm[criteria.key as keyof typeof evaluationForm] === score
                            ? 'bg-amber-500 text-white scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <span className="text-lg font-bold">
                    {evaluationForm[criteria.key as keyof typeof evaluationForm] || 0}
                  </span>
                </div>
                <Textarea
                  placeholder={`Comentario sobre ${criteria.label.toLowerCase()}...`}
                  value={evaluationForm[`${criteria.key}Comment` as keyof typeof evaluationForm] as string}
                  onChange={(e) => setEvaluationForm(prev => ({
                    ...prev,
                    [`${criteria.key}Comment`]: e.target.value
                  }))}
                  className="h-16"
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label>Comentario General</Label>
              <Textarea
                placeholder="Comentario general sobre el proyecto..."
                value={evaluationForm.generalComment}
                onChange={(e) => setEvaluationForm(prev => ({
                  ...prev,
                  generalComment: e.target.value
                }))}
                className="h-24"
              />
            </div>

            {/* Total Score Preview */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Puntaje Total</span>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-amber-500" />
                  <span className="text-2xl font-bold">
                    {(
                      (evaluationForm.innovation +
                        evaluationForm.viability +
                        evaluationForm.impact +
                        evaluationForm.presentation +
                        evaluationForm.scalability +
                        evaluationForm.execution) / 6
                    ).toFixed(1)}
                  </span>
                  <span className="text-gray-500">/10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEvaluationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50"
              onClick={() => handleSaveEvaluation(false)}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
              onClick={() => handleSaveEvaluation(true)}
              disabled={saving}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Evaluación
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
