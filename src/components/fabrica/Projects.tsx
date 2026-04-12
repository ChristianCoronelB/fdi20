'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Search, Trophy, Vote, Eye, Star, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Project } from './types';
import { getStatusColor } from './helpers';

interface ProjectsProps {
  projects: Project[];
  userRole: string;
  onVote: (projectId: string, score: number) => Promise<void>;
}

export function Projects({ projects, userRole, onVote }: ProjectsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [votingOpen, setVotingOpen] = useState(false);
  const [voteScore, setVoteScore] = useState(5);
  const [voting, setVoting] = useState(false);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVote = async () => {
    if (!selectedProject) return;
    setVoting(true);
    await onVote(selectedProject.id, voteScore);
    setVoting(false);
    setVotingOpen(false);
    setSelectedProject(null);
  };

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
            <Lightbulb className="w-6 h-6 text-emerald-500" />
            Proyectos
          </h2>
          <p className="text-gray-500">Explora y vota por los proyectos participantes</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {project.team}
                    </CardDescription>
                  </div>
                  {project.rank && project.rank <= 3 && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      project.rank === 1 ? 'bg-amber-500' :
                      project.rank === 2 ? 'bg-gray-400' : 'bg-amber-700'
                    } text-white`}>
                      <Trophy className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {project.description}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  {project.category && (
                    <Badge variant="outline">{project.category}</Badge>
                  )}
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Vote className="w-4 h-4 text-pink-500" />
                    <span>{project.totalVotes} votos</span>
                  </div>
                  {project.averageEvaluation !== undefined && project.averageEvaluation > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>{project.averageEvaluation.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedProject(project)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                    onClick={() => {
                      setSelectedProject(project);
                      setVotingOpen(true);
                    }}
                  >
                    <Vote className="w-4 h-4 mr-1" />
                    Votar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron proyectos</p>
          </CardContent>
        </Card>
      )}

      {/* Project Detail Dialog */}
      <Dialog open={!!selectedProject && !votingOpen} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.name}</DialogTitle>
                <DialogDescription>{selectedProject.team}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p>{selectedProject.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p className="font-medium">{selectedProject.category || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Total Votos</p>
                    <p className="font-medium">{selectedProject.totalVotes}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Evaluación Promedio</p>
                    <p className="font-medium">
                      {selectedProject.averageEvaluation?.toFixed(1) || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Evaluaciones</p>
                    <p className="font-medium">{selectedProject.evaluationCount || 0}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Voting Dialog */}
      <Dialog open={votingOpen} onOpenChange={setVotingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Votar por {selectedProject?.name}</DialogTitle>
            <DialogDescription>Asigna un puntaje del 1 al 10</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => setVoteScore(score)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${
                    score === voteScore
                      ? 'bg-emerald-500 text-white scale-110'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{voteScore}</p>
              <p className="text-gray-500">puntos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setVotingOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
              onClick={handleVote}
              disabled={voting}
            >
              {voting ? 'Votando...' : 'Confirmar Voto'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
