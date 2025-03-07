import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Message as MessageIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  WhatsApp as WhatsAppIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default
}));

const Dashboard = () => {
  const [stats] = useState({
    totalLeads: 0,
    activeChats: 0,
    monthlyRevenue: 0,
    conversionRate: 0
  });

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Dashboard Administrativo
        </Typography>
        
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Leads
                </Typography>
                <Typography variant="h5">{stats.totalLeads}</Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Conversas Ativas
                </Typography>
                <Typography variant="h5">{stats.activeChats}</Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Receita Mensal
                </Typography>
                <Typography variant="h5">
                  R$ {stats.monthlyRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Taxa de Conversão
                </Typography>
                <Typography variant="h5">
                  {stats.conversionRate}%
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Atividades Recentes
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <WhatsAppIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Novas mensagens do WhatsApp"
                    secondary="0 mensagens não lidas"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <InstagramIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Atividade do Instagram"
                    secondary="0 interações pendentes"
                  />
                </ListItem>
              </List>
            </StyledPaper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>
                Acesso Rápido
              </Typography>
              <List>
                <ListItem button>
                  <ListItemIcon>
                    <MessageIcon />
                  </ListItemIcon>
                  <ListItemText primary="Gerenciar Mensagens" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText primary="Gerenciar Leads" />
                </ListItem>
                <ListItem button>
                  <ListItemIcon>
                    <MoneyIcon />
                  </ListItemIcon>
                  <ListItemText primary="Relatórios Financeiros" />
                </ListItem>
              </List>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;