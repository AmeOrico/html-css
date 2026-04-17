<?php
session_start();

// Se enviou o nome
if (isset($_POST['nome'])) {
    $_SESSION['nome'] = $_POST['nome'];
}

// Se clicou em sair
if (isset($_POST['logout'])) {
    session_destroy();
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sessão PHP</title>
</head>
<body>

<?php if (!isset($_SESSION['nome'])): ?>

    <h1>Digite seu nome</h1>
    <form method="post" action="">
        <input type="text" name="nome" required>
        <button type="submit">Enviar</button>
    </form>

<?php else: ?>

    <h1>Bem-vindo, <?php echo $_SESSION['nome']; ?>!</h1>
    <form method="post" action="">
        <button type="submit" name="logout">Encerrar sessão</button>
    </form>

<?php endif; ?>

</body>
</html>